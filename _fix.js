const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.update({
    where: { email: 'dingkai005@gmail.com' },
    data: { plan: 'free', monthlyRunsUsed: 0 },
  });
  console.log('Updated:', u.email, 'plan:', u.plan, 'credits:', u.credits, 'monthlyRunsUsed:', u.monthlyRunsUsed);
}
main().finally(() => prisma.$disconnect());
