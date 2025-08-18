import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { SignJWT } from "jose";
import { env } from "@/env";
import type { JwtPayloadType } from "@refref/types";
import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db";
const { user: userTable } = schema;

export const referralRouter = createTRPCRouter({
  getWidgetToken: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.user.findFirst({
      where: eq(userTable.id, ctx.userId),
    });

    const payload: JwtPayloadType = {
      sub: ctx.userId,
      email: user!.email,
      name: user!.name,
      projectId: env.NEXT_PUBLIC_REFREF_PROJECT_ID,
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(env.REFERRAL_PROGRAM_CLIENT_SECRET));

    return {
      token,
      clientId: env.REFERRAL_PROGRAM_CLIENT_ID,
      userId: ctx.userId,
    };
  }),
});
