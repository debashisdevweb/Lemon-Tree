/* eslint-disable no-restricted-syntax --
 * The only place raw hex is permitted. <meta name="theme-color"> is parsed by
 * the browser chrome before CSS exists, so it cannot reference a custom
 * property. These two values must stay in sync with --brand-cream and
 * --brand-curtain in styles/tokens.css; tests/unit/tokens.test.ts asserts it.
 */

export const META_THEME_LIGHT = '#eae1d6';
export const META_THEME_DARK = '#26402f';
