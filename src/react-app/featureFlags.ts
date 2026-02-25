// src/react-app/featureFlags.ts
export const FF_LEGISLATOR_LOOKUP =
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('workers.dev');
