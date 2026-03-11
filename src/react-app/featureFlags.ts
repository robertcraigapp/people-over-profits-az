// src/react-app/featureFlags.ts
export const FF_RESOURCES =
    // UNCOMMENT THIS TO DISABLE RESOURCES PAGE EVERYWHERE
    false;

// UNCOMMENT THIS TO ENABLE RESOURCES PAGE ON DEV AND PREVIEW
//    window.location.hostname === 'localhost' ||
//    window.location.hostname.includes('workers.dev');

// UNCOMMENT THIS OUT TO ENABLE RESOURCES PAGE EVERYWEHERE
// true;
export const FF_BILL_TRACKER =
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('workers.dev');

export const FF_LEGISLATOR_LOOKUP =
    // UNCOMMENT THIS TO DISABLE RESOURCES PAGE ON DEV AND PREVIEW
    // false;

    // UNCOMMENT THIS TO ENABLE RESOURCES PAGE ON DEV AND PREVIEW
    //    window.location.hostname === 'localhost' ||
    //    window.location.hostname.includes('workers.dev');

    // UNCOMMENT THIS OUT TO ENABLE RESOURCES PAGE EVERYWEHERE
    true;
