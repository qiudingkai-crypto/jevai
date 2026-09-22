const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.findUnique({ where: { email: 'dingkai005@gmail.com' } });
  console.log(JSON.stringify(u, null, 2));
}
main().finally(() => prisma.$disconnect());
