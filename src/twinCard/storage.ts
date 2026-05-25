import type { TwinCardLead } from "./types";

const STORAGE_KEY = "veevee:twin-card:leads";

function readLeads(): TwinCardLead[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function listTwinCardLeads() {
  return readLeads().sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

export function getTwinCardLead(cardId: string) {
  return readLeads().find((lead) => lead.cardId === cardId) ?? null;
}

export function saveTwinCardLead(lead: TwinCardLead) {
  const nextLeads = [lead, ...readLeads().filter((storedLead) => storedLead.cardId !== lead.cardId)].slice(0, 80);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLeads));
}
