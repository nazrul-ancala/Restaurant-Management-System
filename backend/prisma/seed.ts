import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLE_NAMES = ['Administrator', 'Manager', 'Waiter', 'Chef', 'Cashier'];

async function main() {
  for (const name of ROLE_NAMES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'Administrator' } });
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.employee.upsert({
    where: { email: 'admin@rms.local' },
    update: {},
    create: {
      name: 'Default Admin',
      email: 'admin@rms.local',
      password: passwordHash,
      status: 'active',
      roleId: adminRole.id,
    },
  });

  const TABLES = [
    { name: 'Table 1', capacity: 2 },
    { name: 'Table 2', capacity: 4 },
    { name: 'Table 3', capacity: 4 },
    { name: 'Table 4', capacity: 6 },
  ];

  for (const table of TABLES) {
    const existing = await prisma.table.findFirst({ where: { name: table.name } });
    if (!existing) {
      await prisma.table.create({ data: table });
    }
  }

  const MENU: Record<string, Array<{ name: string; price: number; description: string; status?: string }>> = {
    Appetizers: [
      { name: 'Spring Rolls', price: 12.0, description: 'Crispy rolls with sweet chili dip' },
      { name: 'Chicken Satay', price: 15.0, description: 'Grilled skewers with peanut sauce' },
    ],
    'Main Course': [
      { name: 'Nasi Lemak', price: 18.0, description: 'Coconut rice with sambal, egg and anchovies' },
      {
        name: 'Grilled Chicken Chop',
        price: 22.0,
        description: 'Chargrilled chicken with black pepper sauce',
        status: 'unavailable',
      },
    ],
    Desserts: [{ name: 'Cendol', price: 8.0, description: 'Shaved ice with palm sugar and coconut milk' }],
    Drinks: [
      { name: 'Teh Tarik', price: 5.0, description: 'Frothy pulled milk tea' },
      { name: 'Iced Lemon Tea', price: 6.0, description: 'Refreshing chilled lemon tea' },
    ],
  };

  for (const [categoryName, items] of Object.entries(MENU)) {
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });

    for (const item of items) {
      const existing = await prisma.menuItem.findFirst({ where: { name: item.name } });
      if (!existing) {
        await prisma.menuItem.create({
          data: {
            name: item.name,
            price: item.price,
            description: item.description,
            status: item.status ?? 'available',
            categoryId: category.id,
          },
        });
      }
    }
  }

  const MOVEMENT_TYPE_MAP: Record<string, string> = { received: 'Purchase', used: 'Sale', waste: 'Waste' };

  const INVENTORY: Array<{
    name: string;
    category: string;
    unit: string;
    quantity: number;
    reorderThreshold: number;
    costPerUnit: number;
    movements: Array<{ type: string; delta: number; note: string; createdAt: string }>;
  }> = [
    {
      name: 'Chicken Breast',
      category: 'Meat & Poultry',
      unit: 'kg',
      quantity: 8,
      reorderThreshold: 10,
      costPerUnit: 18.5,
      movements: [
        { type: 'received', delta: 20, note: 'Weekly delivery', createdAt: '2026-07-05T09:00:00' },
        { type: 'used', delta: -12, note: 'Dinner service', createdAt: '2026-07-08T20:00:00' },
      ],
    },
    {
      name: 'Beef Sirloin',
      category: 'Meat & Poultry',
      unit: 'kg',
      quantity: 15,
      reorderThreshold: 8,
      costPerUnit: 32.0,
      movements: [{ type: 'received', delta: 15, note: 'Weekly delivery', createdAt: '2026-07-06T09:00:00' }],
    },
    {
      name: 'Tomatoes',
      category: 'Produce',
      unit: 'kg',
      quantity: 5,
      reorderThreshold: 6,
      costPerUnit: 4.2,
      movements: [
        { type: 'received', delta: 10, note: 'Market run', createdAt: '2026-07-07T08:00:00' },
        { type: 'used', delta: -5, note: 'Lunch + dinner service', createdAt: '2026-07-09T20:00:00' },
      ],
    },
    {
      name: 'Lettuce',
      category: 'Produce',
      unit: 'kg',
      quantity: 12,
      reorderThreshold: 5,
      costPerUnit: 3.5,
      movements: [
        { type: 'received', delta: 15, note: 'Market run', createdAt: '2026-07-07T08:00:00' },
        { type: 'waste', delta: -3, note: 'Wilted', createdAt: '2026-07-08T11:00:00' },
      ],
    },
    {
      name: 'Milk',
      category: 'Dairy',
      unit: 'L',
      quantity: 20,
      reorderThreshold: 10,
      costPerUnit: 2.8,
      movements: [
        { type: 'received', delta: 24, note: 'Dairy delivery', createdAt: '2026-07-06T09:00:00' },
        { type: 'used', delta: -4, note: 'Breakfast service', createdAt: '2026-07-09T08:00:00' },
      ],
    },
    {
      name: 'Rice',
      category: 'Dry Goods',
      unit: 'kg',
      quantity: 40,
      reorderThreshold: 15,
      costPerUnit: 3.0,
      movements: [
        { type: 'received', delta: 50, note: 'Monthly bulk order', createdAt: '2026-07-01T09:00:00' },
        { type: 'used', delta: -10, note: 'Weekly usage', createdAt: '2026-07-08T20:00:00' },
      ],
    },
    {
      name: 'Coca-Cola Syrup',
      category: 'Beverages',
      unit: 'L',
      quantity: 3,
      reorderThreshold: 5,
      costPerUnit: 12.0,
      movements: [
        { type: 'received', delta: 6, note: 'Beverage delivery', createdAt: '2026-07-03T09:00:00' },
        { type: 'used', delta: -3, note: 'Weekly usage', createdAt: '2026-07-09T20:00:00' },
      ],
    },
  ];

  for (const invItem of INVENTORY) {
    const existing = await prisma.inventoryItem.findFirst({ where: { name: invItem.name } });
    if (!existing) {
      const created = await prisma.inventoryItem.create({
        data: {
          name: invItem.name,
          category: invItem.category,
          unit: invItem.unit,
          quantity: invItem.quantity,
          reorderThreshold: invItem.reorderThreshold,
          costPerUnit: invItem.costPerUnit,
        },
      });
      for (const movement of invItem.movements) {
        await prisma.stockMovement.create({
          data: {
            inventoryItemId: created.id,
            type: MOVEMENT_TYPE_MAP[movement.type],
            delta: movement.delta,
            note: movement.note,
            createdAt: new Date(movement.createdAt),
          },
        });
      }
    }
  }

  console.log('Seed complete: 5 roles + default admin (admin@rms.local / admin123) + 4 tables + menu + inventory');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
