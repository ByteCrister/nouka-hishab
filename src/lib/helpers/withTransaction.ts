// lib/helpers/withTransaction.ts
import { db } from "@/config/db";

// Extract the transaction type from Drizzle's db.transaction callback arguments
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function withTransaction<T>(
    fn: (tx: Transaction) => Promise<T>,
    externalTx?: Transaction
): Promise<T> {
    // If already inside a transaction → reuse
    if (externalTx) {
        return fn(externalTx);
    }

    return await db.transaction(async (tx) => {
        return await fn(tx);
    });
}
