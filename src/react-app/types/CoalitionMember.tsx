export interface CoalitionMember {
    id: string | number;
    name: string;
    website?: string;
    // Card fields, unused while the page shows a plain name list
    logo?: string;
    focusArea?: string;
    description?: string;
    founded?: string;
    location?: string;
}
