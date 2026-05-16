import { getRewardById, SWCA_REWARDS } from "./rewards";
import type { SwcaReward } from "./rewards";

type SpinRewardApiResponse = {
  ok?: boolean;
  alreadySpun?: boolean;
  submissionId?: string;
  reward?: {
    id?: string;
    label?: string;
    version?: string;
  };
  message?: string;
};

export type SpinRewardResult = {
  mode: "mock" | "live";
  alreadySpun: boolean;
  reward: SwcaReward & { version?: string };
};

export type RewardContactPayload = {
  submissionId: string;
  token: string;
  firstName: string;
  lastName: string;
  contactMethod: "email" | "phone";
  email?: string;
  phone?: string;
};

type RewardContactApiResponse = {
  message?: string;
  duplicateContact?: boolean;
};

export class RewardContactError extends Error {
  duplicateContact: boolean;

  constructor(message: string, options?: { duplicateContact?: boolean }) {
    super(message);
    this.name = "RewardContactError";
    this.duplicateContact = Boolean(options?.duplicateContact);
  }
}

const SWCA_REWARD_SPIN_API_URL = import.meta.env.VITE_SWCA_REWARD_SPIN_API_URL as string | undefined;

export async function spinSwcaReward({
  submissionId,
  token,
}: {
  submissionId: string;
  token: string;
}): Promise<SpinRewardResult> {
  const endpoint = SWCA_REWARD_SPIN_API_URL?.trim();

  if (!endpoint) {
    return spinMockReward(submissionId);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ submissionId, token }),
  });

  const payload = (await response.json().catch(() => ({}))) as SpinRewardApiResponse;

  if (!response.ok || !payload.reward?.id) {
    throw new Error(payload.message ?? "The reward spin could not be completed.");
  }

  const reward = getRewardById(payload.reward.id);

  return {
    mode: "live",
    alreadySpun: Boolean(payload.alreadySpun),
    reward: {
      ...reward,
      label: payload.reward.label ?? reward.label,
      version: payload.reward.version,
    },
  };
}

export async function submitSwcaRewardContact(payload: RewardContactPayload): Promise<{ mode: "mock" | "live" }> {
  const endpoint = SWCA_REWARD_SPIN_API_URL?.trim();

  if (!endpoint) {
    window.localStorage.setItem(
      `swca-reward-contact:${payload.submissionId}`,
      JSON.stringify({
        firstName: payload.firstName,
        lastName: payload.lastName,
        contactMethod: payload.contactMethod,
        email: payload.email ?? "",
        phone: payload.phone ?? "",
      })
    );
    return { mode: "mock" };
  }

  const contactEndpoint = endpoint.replace(/\/forms\/swca-reward-spin$/, "/forms/swca-reward-contact");
  const response = await fetch(contactEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responsePayload = (await response.json().catch(() => ({}))) as RewardContactApiResponse;

  if (!response.ok) {
    throw new RewardContactError(responsePayload.message ?? "The reward contact details could not be saved.", {
      duplicateContact: Boolean(responsePayload.duplicateContact),
    });
  }

  return { mode: "live" };
}

function spinMockReward(submissionId: string): SpinRewardResult {
  const storageKey = `swca-reward-spin:${submissionId}`;
  const existingRewardId = window.localStorage.getItem(storageKey);

  if (existingRewardId) {
    return {
      mode: "mock",
      alreadySpun: true,
      reward: getRewardById(existingRewardId),
    };
  }

  const reward = SWCA_REWARDS[Math.floor(Math.random() * SWCA_REWARDS.length)];
  window.localStorage.setItem(storageKey, reward.id);

  return {
    mode: "mock",
    alreadySpun: false,
    reward,
  };
}
