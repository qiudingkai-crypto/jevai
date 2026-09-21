const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('=== Users ===');
  console.log(JSON.stringify(users, null, 2));
  
  const accounts = await prisma.account.findMany();
  console.log('=== Accounts ===');
  console.log(JSON.stringify(accounts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
