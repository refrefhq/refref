import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/server/db";
const { participant, referralLink, projectSecrets, program, referral } = schema;
import { and, asc, desc, eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { jwtVerify } from "jose";
import { decode } from "@tsndr/cloudflare-worker-jwt";
import {
  jwtPayloadSchema,
  JwtPayloadType,
  widgetInitRequestSchema,
  WidgetInitResponseType,
} from "@refref/types";
import { env } from "@/env";
import { api } from "@/trpc/server";

// JWT verification function
async function verifyJWT(
  token: string,
  projectId: string,
): Promise<JwtPayloadType | null> {
  try {
    // First decode the JWT without verification to get the project ID
    const { payload } = decode(token);
    const parsedPayload = jwtPayloadSchema.parse(payload);

    // Verify the project ID matches
    if (parsedPayload.projectId !== projectId) {
      console.error("projectId mismatch", {
        expected: projectId,
        actual: parsedPayload.projectId,
      });
      return null;
    }

    // Get project secret from database
    const secret = await db.query.projectSecrets.findFirst({
      where: eq(projectSecrets.projectId, projectId),
    });

    if (!secret) {
      console.error("project secret not found", {
        projectId,
      });
      throw new Error("Project secret not found");
    }

    // Verify the JWT with the project's secret
    const { payload: verifiedPayload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret.clientSecret),
    );

    return jwtPayloadSchema.parse(verifiedPayload);
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 },
      );
    }

    // Parse and validate the request body first to get projectId
    const rawBody = await request.json();
    const body = widgetInitRequestSchema.parse(rawBody);
    const { projectId, referralCode } = body;

    // Extract and verify the JWT
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Invalid authorization header" },
        { status: 401 },
      );
    }

    const decoded = await verifyJWT(token, projectId);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // ensure there is an active program for this project
    const activeProgram = await db.query.program.findFirst({
      where: and(
        eq(program.projectId, projectId),
        eq(program.status, "active"),
      ),
      orderBy: [asc(program.createdAt)],
    });

    if (!activeProgram) {
      return NextResponse.json(
        { error: "No active program found for this project" },
        { status: 400 },
      );
    }

    // Check if participant already exists
    const existingParticipant = await db.query.participant.findFirst({
      where: and(
        eq(participant.projectId, projectId),
        eq(participant.externalId, decoded.sub),
      ),
    });

    const [participantRecord] = await db
      .insert(participant)
      .values({
        externalId: decoded.sub,
        projectId,
        email: decoded.email,
        name: decoded.name,
      })
      .onConflictDoUpdate({
        target: [participant.projectId, participant.externalId],
        set: {
          email: decoded.email,
          name: decoded.name,
        },
      })
      .returning();

    if (!participantRecord) {
      throw new Error("Failed to create or find participant");
    }

    // Auto-attribution: Create referral if RFC provided and participant is new
    let referralRecordId: string | null = null;
    if (referralCode && !existingParticipant) {
      try {
        // Find the referral link by slug
        const referrerLink = await db.query.referralLink.findFirst({
          where: eq(referralLink.slug, referralCode),
        });

        if (referrerLink) {
          // Create referral record linking the new participant (referee) to the referrer
          const referralId = createId();
          const [newReferral] = await db
            .insert(referral)
            .values({
              id: referralId,
              referrerId: referrerLink.participantId,
              externalId: decoded.sub,
              email: decoded.email,
              name: decoded.name,
            })
            .onConflictDoNothing() // Prevent duplicate referrals
            .returning();

          if (newReferral) {
            referralRecordId = newReferral.id;
            console.log("Auto-attribution successful:", {
              referralCode,
              referrerId: referrerLink.participantId,
              refereeId: decoded.sub,
              referralId: referralRecordId,
            });

            // Create signup event for reward processing
            try {
              await api.events.create({
                projectId,
                programId: activeProgram.id,
                eventType: "signup",
                participantId: participantRecord.id,
                referralId: referralRecordId,
                metadata: {
                  schemaVersion: 1,
                  source: "auto",
                  reason: "Widget initialization with referral code",
                },
              });
              console.log("Created signup event for referral attribution");
            } catch (eventError) {
              console.error("Failed to create signup event:", eventError);
              // Don't fail widget init if event creation fails
            }
          }
        } else {
          console.warn("Referral code not found:", referralCode);
        }
      } catch (error) {
        // Log but don't fail widget init on attribution errors
        console.error("Auto-attribution failed:", error);
      }
    }

    // Get or create referral link
    let referralLinkRecord = await db.query.referralLink.findFirst({
      where: eq(referralLink.participantId, participantRecord.id),
    });

    const programData = await db.query.program.findFirst({
      where: eq(program.id, activeProgram.id),
    });

    const widgetData = programData?.config?.widgetConfig;

    if (!referralLinkRecord) {
      const [newLink] = await db
        .insert(referralLink)
        .values({
          id: createId(),
          participantId: participantRecord.id,
          slug: createId().slice(0, 8), // Using first 8 chars of cuid as slug
        })
        .onConflictDoNothing()
        .returning();
      referralLinkRecord = newLink;
    }

    if (!referralLinkRecord) {
      throw new Error("Failed to create or find referral link");
    }

    console.log("widgetData from init route: ", widgetData);
    // Return the referral link
    const response: WidgetInitResponseType = {
      ...widgetData!,
      referralLink: `${env.NEXT_PUBLIC_APP_URL}/r/${referralLinkRecord.slug}`,

      // referralLink: {
      //   code: referralLinkRecord.slug,
      //   url: `${env.NEXT_PUBLIC_APP_URL}/r/${referralLinkRecord.slug}`,
      // },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in widget init:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }
    if (
      error instanceof Error &&
      error.message === "Project secret not found"
    ) {
      return NextResponse.json(
        { error: "Invalid project or project not configured" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
