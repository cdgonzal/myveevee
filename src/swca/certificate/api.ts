export type SwcaRewardCertificate = {
  certificateId: string;
  submissionId: string;
  rewardId: string;
  rewardLabel: string;
  rewardDescription: string;
  estimatedValue: string;
  issuedTo: string;
  issuedAt: string;
  expiresAt: string;
};

type CertificateResponse = {
  ok?: boolean;
  certificate?: SwcaRewardCertificate;
  message?: string;
};

const CERTIFICATE_ENDPOINT = import.meta.env.VITE_SWCA_REWARD_CERTIFICATE_API_URL as string | undefined;
const REWARD_SPIN_ENDPOINT = import.meta.env.VITE_SWCA_REWARD_SPIN_API_URL as string | undefined;

export async function fetchSwcaRewardCertificate(certificateId: string, token: string): Promise<SwcaRewardCertificate> {
  const endpoint = resolveCertificateEndpoint();

  if (!endpoint) {
    if (!canUseMockCertificateApi()) {
      throw new Error("The reward certificate endpoint is not configured.");
    }

    return createMockCertificate(certificateId);
  }

  const url = new URL(endpoint);
  url.searchParams.set("certificateId", certificateId);
  url.searchParams.set("token", token);

  const response = await fetch(url.toString(), {
    method: "GET",
  });
  const payload = (await response.json().catch(() => ({}))) as CertificateResponse;

  if (!response.ok || !payload.certificate) {
    throw new Error(payload.message ?? "This reward certificate could not be loaded.");
  }

  return payload.certificate;
}

function resolveCertificateEndpoint() {
  const explicitEndpoint = CERTIFICATE_ENDPOINT?.trim();
  if (explicitEndpoint) return explicitEndpoint;

  const spinEndpoint = REWARD_SPIN_ENDPOINT?.trim();
  if (!spinEndpoint) return "";
  return spinEndpoint.replace(/\/forms\/swca-reward-spin$/, "/forms/swca-reward-certificate");
}

function canUseMockCertificateApi() {
  return import.meta.env.DEV || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function createMockCertificate(certificateId: string): SwcaRewardCertificate {
  return {
    certificateId,
    submissionId: "local-preview-003",
    rewardId: "wellness-gift",
    rewardLabel: "Wellness Gift",
    rewardDescription: "A curated wellness reward selected by the Spine and Wellness team.",
    estimatedValue: "$25 value",
    issuedTo: "J. S.",
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}
