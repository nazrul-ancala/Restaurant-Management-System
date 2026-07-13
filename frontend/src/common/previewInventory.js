// Preview rows shown only until the backend returns real inventory — automatically
// replaced once getInventoryItems() actually returns something.
export const PREVIEW_INVENTORY = [
  {
    id: 1,
    name: "Chicken Breast",
    category: "Meat & Poultry",
    unit: "kg",
    quantity: 8,
    reorderThreshold: 10,
    costPerUnit: 18.5,
    movements: [
      { id: "1-1", type: "received", delta: 20, note: "Weekly delivery", createdAt: "2026-07-05T09:00:00" },
      { id: "1-2", type: "used", delta: -12, note: "Dinner service", createdAt: "2026-07-08T20:00:00" },
    ],
  },
  {
    id: 2,
    name: "Beef Sirloin",
    category: "Meat & Poultry",
    unit: "kg",
    quantity: 15,
    reorderThreshold: 8,
    costPerUnit: 32.0,
    movements: [
      { id: "2-1", type: "received", delta: 15, note: "Weekly delivery", createdAt: "2026-07-06T09:00:00" },
    ],
  },
  {
    id: 3,
    name: "Tomatoes",
    category: "Produce",
    unit: "kg",
    quantity: 5,
    reorderThreshold: 6,
    costPerUnit: 4.2,
    movements: [
      { id: "3-1", type: "received", delta: 10, note: "Market run", createdAt: "2026-07-07T08:00:00" },
      { id: "3-2", type: "used", delta: -5, note: "Lunch + dinner service", createdAt: "2026-07-09T20:00:00" },
    ],
  },
  {
    id: 4,
    name: "Lettuce",
    category: "Produce",
    unit: "kg",
    quantity: 12,
    reorderThreshold: 5,
    costPerUnit: 3.5,
    movements: [
      { id: "4-1", type: "received", delta: 15, note: "Market run", createdAt: "2026-07-07T08:00:00" },
      { id: "4-2", type: "waste", delta: -3, note: "Wilted", createdAt: "2026-07-08T11:00:00" },
    ],
  },
  {
    id: 5,
    name: "Milk",
    category: "Dairy",
    unit: "L",
    quantity: 20,
    reorderThreshold: 10,
    costPerUnit: 2.8,
    movements: [
      { id: "5-1", type: "received", delta: 24, note: "Dairy delivery", createdAt: "2026-07-06T09:00:00" },
      { id: "5-2", type: "used", delta: -4, note: "Breakfast service", createdAt: "2026-07-09T08:00:00" },
    ],
  },
  {
    id: 6,
    name: "Rice",
    category: "Dry Goods",
    unit: "kg",
    quantity: 40,
    reorderThreshold: 15,
    costPerUnit: 3.0,
    movements: [
      { id: "6-1", type: "received", delta: 50, note: "Monthly bulk order", createdAt: "2026-07-01T09:00:00" },
      { id: "6-2", type: "used", delta: -10, note: "Weekly usage", createdAt: "2026-07-08T20:00:00" },
    ],
  },
  {
    id: 7,
    name: "Coca-Cola Syrup",
    category: "Beverages",
    unit: "L",
    quantity: 3,
    reorderThreshold: 5,
    costPerUnit: 12.0,
    movements: [
      { id: "7-1", type: "received", delta: 6, note: "Beverage delivery", createdAt: "2026-07-03T09:00:00" },
      { id: "7-2", type: "used", delta: -3, note: "Weekly usage", createdAt: "2026-07-09T20:00:00" },
    ],
  },
];
