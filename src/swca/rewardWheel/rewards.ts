import rewardWheelConfig from "./reward-wheel-config.json";

export type SwcaRewardId = string;

export type SwcaReward = {
  id: SwcaRewardId;
  slotNumber: number;
  label: string;
  shortLabel: string;
  description: string;
  estimatedValue: string;
  weight: number;
  color: string;
};

export const SWCA_REWARD_CAMPAIGN_ID = rewardWheelConfig.campaignId;
export const SWCA_REWARD_VERSION = rewardWheelConfig.rewardVersion;
export const SWCA_REWARDS: SwcaReward[] = rewardWheelConfig.slots;

export function getRewardIndex(rewardId: string) {
  const index = SWCA_REWARDS.findIndex((reward) => reward.id === rewardId);
  return index >= 0 ? index : 0;
}

export function getRewardById(rewardId: string) {
  return SWCA_REWARDS.find((reward) => reward.id === rewardId) ?? SWCA_REWARDS[0];
}
