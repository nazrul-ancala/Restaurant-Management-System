export const ROLES = {
  ADMINISTRATOR: 'Administrator',
  MANAGER: 'Manager',
  WAITER: 'Waiter',
  CHEF: 'Chef',
  CASHIER: 'Cashier',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];
