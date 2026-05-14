export type SwcaAdminSession = {
  token: string;
  expiresAt: number;
};

export type SwcaAdminMetrics = {
  totalIntakes: number;
  rewardsClaimed: number;
  rewardContactsSaved: number;
  uniqueCampaignSessions: number;
  firstPartyEvents: number;
  funnelProfileClicks: number;
};

export type SwcaAdminClaim = {
  submissionId: string;
  status: string;
  createdAt: string;
  spunAt: string;
  contactSavedAt: string;
  sourcePath: string;
  rewardId: string;
  rewardLabel: string;
  contactMethod: string;
  contactName: string;
};

export type SwcaAdminEvent = {
  eventId: string;
  eventName: string;
  occurredAt: string;
  pagePath: string;
  sessionId: string;
  submissionId: string;
  rewardId: string;
  contactMethod: string;
  mode: string;
};

export type SwcaAdminReport = {
  generatedAt: string;
  metrics: SwcaAdminMetrics;
  rewardDistribution: Record<string, number>;
  contactMethodDistribution: Record<string, number>;
  eventCounts: Record<string, number>;
  recentClaims: SwcaAdminClaim[];
  recentEvents: SwcaAdminEvent[];
};

const SESSION_ENDPOINT = import.meta.env.VITE_SWCA_ADMIN_SESSION_API_URL as string | undefined;
const REPORT_ENDPOINT = import.meta.env.VITE_SWCA_ADMIN_REPORT_API_URL as string | undefined;

export async function createSwcaAdminSession(passcode: string): Promise<SwcaAdminSession> {
  const endpoint = SESSION_ENDPOINT?.trim();

  if (!endpoint) {
    if (!canUseMockAdminApi()) {
      throw new Error("The SWCA admin session endpoint is not configured.");
    }

    return {
      token: "local-preview-token",
      expiresAt: Math.floor(Date.now() / 1000) + 60 * 60,
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ passcode }),
  });
  const payload = (await response.json().catch(() => ({}))) as Partial<SwcaAdminSession> & { message?: string };

  if (!response.ok || !payload.token || !payload.expiresAt) {
    throw new Error(payload.message ?? "The admin session could not be created.");
  }

  return {
    token: payload.token,
    expiresAt: payload.expiresAt,
  };
}

export async function fetchSwcaAdminReport(token: string): Promise<SwcaAdminReport> {
  const endpoint = REPORT_ENDPOINT?.trim();

  if (!endpoint) {
    if (!canUseMockAdminApi()) {
      throw new Error("The SWCA admin report endpoint is not configured.");
    }

    return createMockReport();
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as Partial<SwcaAdminReport> & { message?: string };

  if (!response.ok || !payload.metrics) {
    throw new Error(payload.message ?? "The admin report could not be loaded.");
  }

  return {
    generatedAt: payload.generatedAt ?? new Date().toISOString(),
    metrics: payload.metrics,
    rewardDistribution: payload.rewardDistribution ?? {},
    contactMethodDistribution: payload.contactMethodDistribution ?? {},
    eventCounts: payload.eventCounts ?? {},
    recentClaims: payload.recentClaims ?? [],
    recentEvents: payload.recentEvents ?? [],
  };
}

function canUseMockAdminApi() {
  return import.meta.env.DEV || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function createMockReport(): SwcaAdminReport {
  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      totalIntakes: 3,
      rewardsClaimed: 2,
      rewardContactsSaved: 1,
      uniqueCampaignSessions: 4,
      firstPartyEvents: 14,
      funnelProfileClicks: 1,
    },
    rewardDistribution: {
      "Wellness Gift": 1,
      "Healthy Snack Pack": 1,
    },
    contactMethodDistribution: {
      email: 1,
    },
    eventCounts: {
      swca_page_view: 7,
      swca_intake_submit_success: 3,
      swca_reward_spin_success: 2,
      swca_reward_contact_saved: 1,
      swca_profile_funnel_create_free_profile: 1,
    },
    recentClaims: [
      {
        submissionId: "local-preview-003",
        status: "claimed",
        createdAt: new Date().toISOString(),
        spunAt: new Date().toISOString(),
        contactSavedAt: new Date().toISOString(),
        sourcePath: "/swca/intake",
        rewardId: "wellness-gift",
        rewardLabel: "Wellness Gift",
        contactMethod: "email",
        contactName: "J. S.",
      },
    ],
    recentEvents: [],
  };
}
