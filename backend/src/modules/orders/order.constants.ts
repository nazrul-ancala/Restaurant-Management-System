import { ROLES, type RoleName } from '../../constants/roles';

export const ORDER_TYPES_REQUIRING_TABLE = ['Dine-In', 'QR Order'];

export const TERMINAL_STATUSES = ['Completed', 'Cancelled', 'Refunded'];

// Forward happy-path chain; Cancelled is reachable separately from any non-terminal status.
export const NEXT_STATUS: Record<string, string> = {
  Pending: 'Preparing',
  Preparing: 'Ready',
  Ready: 'Served',
  Served: 'Completed',
};

// Inverse of NEXT_STATUS, used to validate recall/undo transitions.
export const PREV_STATUS: Record<string, string> = Object.entries(NEXT_STATUS).reduce(
  (acc, [status, next]) => {
    acc[next] = status;
    return acc;
  },
  {} as Record<string, string>
);

// Judgment call (docs only specify BR-010/BR-011 for create/cooking-status): who may perform
// each specific status transition. Recall/undo mirrors whoever owns the forward transition
// being undone. Cancel is its own bucket since it's reachable from any non-terminal status.
export const TRANSITION_ROLES: Record<string, RoleName[]> = {
  'Pending->Preparing': [ROLES.CHEF, ROLES.MANAGER, ROLES.ADMINISTRATOR],
  'Preparing->Ready': [ROLES.CHEF, ROLES.MANAGER, ROLES.ADMINISTRATOR],
  'Ready->Served': [ROLES.WAITER, ROLES.MANAGER, ROLES.ADMINISTRATOR],
  'Served->Completed': [ROLES.CASHIER, ROLES.MANAGER, ROLES.ADMINISTRATOR],
  'Preparing->Pending': [ROLES.CHEF, ROLES.MANAGER, ROLES.ADMINISTRATOR],
  'Ready->Preparing': [ROLES.CHEF, ROLES.MANAGER, ROLES.ADMINISTRATOR],
  'Served->Ready': [ROLES.WAITER, ROLES.MANAGER, ROLES.ADMINISTRATOR],
  // Refund is the one transition allowed OUT of a terminal status (Completed) — see the
  // explicit carve-out in order.service.ts's updateStatus.
  'Completed->Refunded': [ROLES.CASHIER, ROLES.MANAGER, ROLES.ADMINISTRATOR],
};

export const CANCEL_ROLES: RoleName[] = [ROLES.WAITER, ROLES.MANAGER, ROLES.ADMINISTRATOR];

export const PAYMENT_METHODS = ['Cash', 'Debit Card', 'Credit Card', 'DuitNow QR'];
