import { NextResponse } from 'next/server';
import { AvailabilityError } from '@/lib/booking/adapter';
import { getAvailabilityAdapter } from '@/lib/booking/mock';
import { availabilityRequestSchema } from '@/lib/booking/schemas';

/**
 * The availability boundary.
 *
 * Validates in, validates out (the adapter parses its own response), and never
 * leaks an internal error message to the client. Rates must not be cached.
 */
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const parsed = availabilityRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'That search is not valid.',
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 422 }
    );
  }

  try {
    const result = await getAvailabilityAdapter().search(parsed.data);
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (error instanceof AvailabilityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    // Anything else is a bug on our side; say so without detail.
    return NextResponse.json(
      { error: 'We could not reach the booking system. Please try again.' },
      { status: 502 }
    );
  }
}
