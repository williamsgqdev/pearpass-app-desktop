/**
 * Shared layout constants for v2 app chrome.
 *
 * `HEADER_MIN_HEIGHT` is the shared height used across all top-of-column
 * headers in the v2 design (sidebar vault header, main view breadcrumb,
 * multi-select actions bar, settings header, record details header) so they
 * line up horizontally when rendered side by side.
 *
 * `FADE_GRADIENT_HEIGHT` is the bottom-edge fade height that scroll areas use
 * to hint at more content below. Scroll areas also pad their bottom by the
 * same amount so the last row isn't permanently hidden under the gradient.
 */
export const HEADER_MIN_HEIGHT = 44
export const FADE_GRADIENT_HEIGHT = 70
