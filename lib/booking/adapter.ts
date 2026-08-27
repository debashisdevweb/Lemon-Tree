import type { AvailabilityRequest, AvailabilityResponse } from './schemas';

/**
 * The seam the real CRS drops into.
 *
 * No UI imports a concrete implementation — components call the API route, the
 * route calls whatever `getAvailabilityAdapter()` returns. Swapping the mock
 * for Synxis/TravelClick means adding one file and one env branch; no component
 * changes.
 */
export interface AvailabilityAdapter {
  readonly name: string;
  search(request: AvailabilityRequest): Promise<AvailabilityResponse>;
}

/** Thrown for a boundary failure the UI is expected to render, not a bug. */
export class AvailabilityError extends Error {
  constructor(
    message: string,
    readonly status: number = 502
  ) {
    super(message);
    this.name = 'AvailabilityError';
  }
}
