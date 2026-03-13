import type { Legislator } from '../shared/legislatorTypes';
import type { BillResponse } from '../shared/billTypes';

// --- Internal helpers ---

function deriveTitle(office: string): string {
    if (office.includes('Senator')) return 'Senator';
    if (office.includes('Representative')) return 'Representative';
    return 'Representative';
}

function deriveLastName(name: string): string {
    return name.split(' ').at(-1) ?? name;
}

type Position = 'support' | 'oppose' | 'monitor' | 'mixed';

function resolvePosition(bills: BillResponse[]): Position {
    const positions = new Set(bills.map((b) => b.popazPosition));
    return positions.size === 1 ? bills[0].popazPosition : 'mixed';
}

function openingPhrase(position: Position, count: number): string {
    const billWord = count === 1 ? 'the following bill' : 'the following bills';
    if (position === 'support') return `urge your support of ${billWord}`;
    if (position === 'oppose') return `urge your opposition to ${billWord}`;
    if (position === 'monitor') return `ask you to carefully consider ${billWord}`;
    // mixed
    return 'write about the following bills'; // unused for mixed — see openingLine
}

function openingLine(position: Position, count: number): string {
    if (position === 'mixed') {
        return 'I am your constituent writing about the following bills.';
    }
    return `I am your constituent writing to ${openingPhrase(position, count)}.`;
}

function billTitleLine(bill: BillResponse): string {
    return bill.bill?.title ? `${bill.billNumber} — ${bill.bill.title}` : bill.billNumber;
}

function perBillClosingSentence(bill: BillResponse): string {
    if (bill.popazPosition === 'support') return `I urge you to vote yes on ${bill.billNumber}.`;
    if (bill.popazPosition === 'oppose') return `I urge you to vote no on ${bill.billNumber}.`;
    return `I ask you to carefully consider ${bill.billNumber}.`;
}

function phoneAsk(bill: BillResponse): string {
    if (bill.popazPosition === 'support') return `vote yes on ${bill.billNumber}`;
    if (bill.popazPosition === 'oppose') return `vote no on ${bill.billNumber}`;
    return `carefully consider ${bill.billNumber}`;
}

function emailSubject(bills: BillResponse[]): string {
    const numbers = bills.map((b) => b.billNumber).join(', ');
    const position = resolvePosition(bills);
    const countWord = bills.length === 1 ? 'this bill' : 'these bills';
    if (position === 'support') return `${numbers} — Please support ${countWord}`;
    if (position === 'oppose') return `${numbers} — Please oppose ${countWord}`;
    if (position === 'monitor') return `${numbers} — Please carefully consider ${countWord}`;
    return `${numbers} — Please review ${countWord}`;
}

// --- Public API ---

export function generateLetter(
    legislator: Legislator,
    bills: BillResponse[],
    userName?: string,
): string {
    const title = deriveTitle(legislator.office);
    const lastName = deriveLastName(legislator.name);
    const position = resolvePosition(bills);
    const name = userName?.trim() || '[Your name]';

    const perBillBlocks = bills
        .map((bill) =>
            [billTitleLine(bill), '', bill.popazInsight, '', perBillClosingSentence(bill)].join('\n'),
        )
        .join('\n\n');

    return [
        `Dear ${title} ${lastName},`,
        '',
        openingLine(position, bills.length),
        '',
        perBillBlocks,
        '',
        'Respectfully,',
        name,
    ].join('\n');
}

export function generateEmailContent(
    legislator: Legislator,
    bills: BillResponse[],
    userName?: string,
): { subject: string; body: string } {
    return {
        subject: emailSubject(bills),
        body: generateLetter(legislator, bills, userName),
    };
}

export function generatePhoneScript(
    legislator: Legislator,
    bills: BillResponse[],
    userName?: string,
): string {
    const title = deriveTitle(legislator.office);
    const lastName = deriveLastName(legislator.name);
    const name = userName?.trim() || '[your name]';
    const billNumbers = bills.map((b) => b.billNumber).join(', ');

    const perBillBlocks = bills
        .map((bill) =>
            [
                `I'm calling to ask ${title} ${lastName} to ${phoneAsk(bill)}.`,
                '',
                bill.popazInsight,
            ].join('\n'),
        )
        .join('\n\n');

    return [
        `Hi, my name is ${name} and I'm a constituent calling about ${billNumbers}.`,
        '',
        perBillBlocks,
        '',
        'Thank you for your time.',
    ].join('\n');
}
