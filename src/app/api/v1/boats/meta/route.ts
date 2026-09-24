import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { boats } from "@/db/boat";
import { users } from "@/db/app";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult } from "@/lib/helpers/withErrorHandler";
import type { BoatMeta } from '@/types/trips.types';


export const GET = withErrorHandler<BoatMeta[], [NextRequest]>(
  async (_req): Promise<HandlerResult<BoatMeta[]>> => {
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.publicId, userPublicId))
      .limit(1);

    if (!userRecord) throw new Error("User not found");


    const conditions = [
      isNull(boats.deletedAt),
      eq(boats.createdBy, userRecord.id),
    ];


    const metaRecords = await db
      .select({
        id: boats.id,
        publicId: boats.publicId,
        name: boats.name,
        capacityValue: boats.capacityValue,
        capacityUnit: boats.capacityUnit,
      })
      .from(boats)
      .where(and(...conditions))
      .orderBy(boats.name);

    return { data: metaRecords as BoatMeta[] };
  }
);


