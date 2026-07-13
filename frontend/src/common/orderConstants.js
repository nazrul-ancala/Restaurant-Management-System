export const ORDER_TYPES = [
  { value: "Dine-In", color: "primary" },
  { value: "Takeaway", color: "info" },
  { value: "QR Order", color: "secondary" },
];

export const STATUS_BADGE = {
  Pending: "warning",
  Preparing: "info",
  Ready: "primary",
  Served: "secondary",
  Completed: "success",
  Cancelled: "danger",
};

// Linear happy-path progression; Cancelled is reachable separately from any non-terminal status.
export const NEXT_STATUS = {
  Pending: { next: "Preparing", label: "Start Preparing" },
  Preparing: { next: "Ready", label: "Mark Ready" },
  Ready: { next: "Served", label: "Mark Served" },
  Served: { next: "Completed", label: "Complete" },
};

export const TERMINAL_STATUSES = ["Completed", "Cancelled"];

// QR Order means the customer scans a code at their table, so it needs a
// table just like Dine-In; only Takeaway has no table.
export const ORDER_TYPES_REQUIRING_TABLE = ["Dine-In", "QR Order"];

// QR Order is self-service: the customer scans the table's code and picks
// their own items, so staff never manually key one in via the New Order
// form — it only ever arrives from that (future) customer-facing flow.
export const MANUAL_ORDER_TYPES = ORDER_TYPES.filter((t) => t.value !== "QR Order");

export const PAYMENT_METHODS = ["Cash", "Debit Card", "Credit Card", "DuitNow QR"];
