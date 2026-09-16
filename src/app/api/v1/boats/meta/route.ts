import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { boats } from "@/db/boat";
import { users } from "@/db/app";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { SECTORS } from "@/constants/db/app.const";
import { BoatMeta } from "@/types/sand/trips.types";

const getBoatsMetaSchema = z.object({
  sector: z.enum([SECTORS.SAND, SECTORS.LIME_STONE, SECTORS.BRICK, "all"]).optional().default("all"),
});

export const GET = withErrorHandler<BoatMeta[], [NextRequest]>(
  async (req): Promise<HandlerResult<BoatMeta[]>> => {
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.publicId, userPublicId))
      .limit(1);

    if (!userRecord) throw new Error("User not found");

    const { searchParams } = new URL(req.url);
    const query = getBoatsMetaSchema.parse(Object.fromEntries(searchParams));

    const conditions = [
      isNull(boats.deletedAt),
      eq(boats.createdBy, userRecord.id),
    ];

    if (query.sector && query.sector !== "all") {
      conditions.push(eq(boats.sector, query.sector as typeof SECTORS[keyof typeof SECTORS]));
    }

    const metaRecords = await db
      .select({
        publicId: boats.publicId,
        name: boats.name,
        sector: boats.sector,
        capacityValue: boats.capacityValue,
        capacityUnit: boats.capacityUnit,
      })
      .from(boats)
      .where(and(...conditions))
      .orderBy(boats.name);

    return { data: metaRecords as BoatMeta[] };
  }
);
