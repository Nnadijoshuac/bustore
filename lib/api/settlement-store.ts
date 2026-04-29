import type { Settlement } from "@/types";

let settlements: Settlement[] = [];

function sortSettlements(items: Settlement[]) {
  return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function listStoredSettlements() {
  return sortSettlements(settlements);
}

export function rememberSettlement(settlement: Settlement) {
  settlements = sortSettlements([settlement, ...settlements.filter((item) => item.id !== settlement.id)]).slice(0, 50);
  return settlement;
}
