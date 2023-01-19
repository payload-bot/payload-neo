export type BanResult = {
  isBanned: boolean;
  reason: string | null;
  bannedUntil: Date | null;
};
