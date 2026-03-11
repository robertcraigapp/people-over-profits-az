// Matches one entry in trackedBills.json
export type TrackedBill = {
    billNumber: string;
    popazInsight: string;
    popazPosition: 'oppose' | 'support' | 'monitor';
};

// What the worker stores in KV for the masterlist
// Key: "legiscan:masterlist"
export type MasterlistCache = {
    [billNumber: string]: {
        billId: number;
        changeHash: string;
    };
};

// What the worker stores in KV per bill
// Key: "legiscan:bill:{billId}"
export type BillCache = {
    changeHash: string;
    data: LegiScanBill;
};

// Minimal LegiScan bill shape (only fields we use)
export type LegiScanBill = {
    bill_id: number;
    bill_number: string;
    title: string;
    description: string;
    status: number; // 1=Introduced, 2=Engrossed, 3=Enrolled, 4=Passed, 5=Vetoed, 6=Failed
    status_date: string;
    url: string;
    state_link: string;
    history: {
        date: string;
        action: string;
        chamber: string;
        importance: number;
    }[];
    sponsors: {
        name: string;
        party: string;
        role: string;
    }[];
};

// Shape returned by GET /api/bills
export type BillResponse = {
    billNumber: string;
    popazInsight: string;
    popazPosition: 'oppose' | 'support' | 'monitor';
    bill: LegiScanBill | null; // null if LegiScan lookup failed
};
