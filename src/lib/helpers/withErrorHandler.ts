// lib/helpers/withErrorHandler.ts

import { NextResponse } from "next/server";

/**
 * Custom error class for API handlers.
 *
 * Extends the native `Error` object with an HTTP status code,
 * allowing you to throw typed errors that can be caught and
 * translated into standardized API responses.
 */
export class ApiError extends Error {
    /** HTTP status code associated with the error */
    status: number;

    /**
     * @param message - Human-readable error message
     * @param status - HTTP status code (defaults to 500)
     */
    constructor(message: string, status = 500) {
        super(message);
        this.status = status;
    }
}

/**
 * Standardized result type returned by handler functions.
 *
 * @template T - The type of the data payload returned on success.
 */
export type HandlerResult<T> = {
    /** The data payload returned from the handler */
    data: T;

    /** Optional HTTP status code (defaults to 200 if not provided) */
    status?: number;

    /**
     * When true, the data is a fallback (date-range had no results so we
     * returned the most recent available data for this company).
     * Consumers can use this to show an "initial / demo data" notice.
     */
    isInitialData?: boolean;
};

/**
 * Higher-order function that wraps an async API handler with
 * consistent error handling and response formatting.
 *
 * - On success: returns `{ data, isInitialData? }` with the given status.
 * - On failure: catches errors, logs them, and returns
 *   `{ error }` with the appropriate status.
 *
 * @template T - The type of the data payload returned on success.
 * @template Args - The argument types accepted by the handler function.
 *
 * @param fn - Async handler function that returns a `HandlerResult<T>`.
 * @returns A wrapped handler that produces a `NextResponse<ApiResponse<T>>`.
 */
export function withErrorHandler<T, Args extends unknown[]>(
    fn: (...args: Args) => Promise<HandlerResult<T>>
): (...args: Args) => Promise<NextResponse<{ data: T; isInitialData?: boolean } | { error: string }>> {
    return async (...args: Args) => {
        try {
            const { data, status = 200, isInitialData } = await fn(...args);

            return NextResponse.json(
                isInitialData ? { data, isInitialData: true } : { data },
                { status }
            );
        } catch (err: unknown) {
            let message = "Internal Server Error";
            let status = 500;

            if (err instanceof ApiError) {
                message = err.message;
                status = err.status;
            } else if (err instanceof Error) {
                message = err.message;

                // Handle common Neon / PostgreSQL errors
                if ('code' in err && typeof err.code === 'string') {
                    switch (err.code) {
                        case '23505': // unique_violation
                            message = 'A record with this information already exists.';
                            status = 409;
                            if ('detail' in err && typeof err.detail === 'string') {
                                message = err.detail;
                            }
                            break;
                        case '23503': // foreign_key_violation
                            message = 'Related record not found or cannot be modified.';
                            status = 400;
                            break;
                        case '22P02': // invalid_text_representation
                            message = 'Invalid data format provided.';
                            status = 400;
                            break;
                    }
                }
            }

            console.error("API Error:", err);

            return NextResponse.json({ error: message }, { status });
        }
    };
}