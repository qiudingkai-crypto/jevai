import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "dingkai005@gmail.com";

export async function isDirectoryAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      accounts: { where: { provider: "google" }, select: { id: true }, take: 1 },
    },
  });

  return user?.email.toLowerCase() === ADMIN_EMAIL && user.accounts.length > 0;
}
