import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/server/db";
const { program } = schema;
import { eq } from "drizzle-orm";

// Request schema for program ID parameter
const programIdSchema = z.object({
  programId: z.string().min(1, "Program ID is required"),
});

export async function GET(request: Request) {
  try {
    // Get program ID from URL parameters
    const url = new URL(request.url);
    const programId = url.searchParams.get("programId");

    if (!programId) {
      return NextResponse.json(
        { error: "Program ID is required" },
        { status: 400 },
      );
    }

    // Validate the program ID
    const validatedParams = programIdSchema.parse({ programId });

    // Fetch the program from database
    const programRecord = await db.query.program.findFirst({
      where: eq(program.id, validatedParams.programId),
    });

    if (!programRecord) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Return the program data
    return NextResponse.json({
      success: true,
      data: programRecord,
    });
  } catch (error) {
    console.error("Error fetching program:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Also support POST method for consistency with other routes
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const validatedParams = programIdSchema.parse(body);

    // Fetch the program from database
    const programRecord = await db.query.program.findFirst({
      where: eq(program.id, validatedParams.programId),
    });

    if (!programRecord) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Return the program data
    return NextResponse.json({
      success: true,
      data: programRecord,
    });
  } catch (error) {
    console.error("Error fetching program:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
