export const MONTHLY_PLAN_AMOUNT = 300;
export const FAILED_PAYMENT_GRACE_DAYS = 7;

export function getGracePeriodEnd(failedAt = new Date()) {
  const end = new Date(failedAt);
  end.setDate(end.getDate() + FAILED_PAYMENT_GRACE_DAYS);
  return end;
}

export function getSubscriptionPeriodEnd(from = new Date()) {
  const end = new Date(from);
  end.setMonth(end.getMonth() + 1);
  return end;
}
