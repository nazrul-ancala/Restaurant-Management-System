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

  console.log('Seed complete: 5 roles + default admin (admin@rms.local / admin123) + 4 tables');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
