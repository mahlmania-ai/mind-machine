// Derived from bilawalsidhu/gods-eye-view@9554d6ea71f7da548d31eb78d812b32f90e15a81/src/i18n/marker.js
// Copyright (c) 2026 Bilawal Sidhu. MIT; see ../../atlas/UPSTREAM-LICENSE.
// msg() for modules the server, tools or other portable code also import:
// marks English that stays in data for `npm run i18n`, without loading the
// catalogs (src/i18n/index.js). The UI shows it later through t().
// Browser-only modules import msg from src/i18n/index.js instead.

/** Mark English text that is stored in data and translated later by t(). */
export const msg = (text) => text;
