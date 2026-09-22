import { prisma } from "@/lib/prisma";
import { isDirectoryAdmin } from "@/lib/directory-admin";
import AddWebsiteForm from "./AddWebsiteForm";
import AdminActions from "./AdminActions";
import SiteHeader from "@/app/components/SiteHeader";
import styles from "./page.module.css";

const PAGE_SIZE = 12;

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const requestedPage = Number((await searchParams).page ?? 1);
  const total = await prisma.directoryWebsite.count();
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Number.isSafeInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), pageCount)
    : 1;
  const [websites, canAdd] = await Promise.all([
    prisma.directoryWebsite.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    isDirectoryAdmin(),
  ]);

  return (
    <>
      <SiteHeader active="directory" />

      <main className={`${styles.main} shell`}>
        <div className={styles.heading}>
          <div>
            <h1>Explore apps built on Jev</h1>
            <p>See what people are building with the TypeSafe Jev model. Click a card to visit the site.</p>
          </div>
          {canAdd && <AddWebsiteForm />}
        </div>

        <div className={styles.grid}>
          {websites.map((website) => {
            const icon = website.iconUrl ?? `${new URL(website.url).origin}/favicon.ico`;
            return (
              <div className={styles.cardWrapper} key={website.id}>
                <a
                  className={styles.card}
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.cardTop}>
                    <span className={styles.icon} style={{ backgroundImage: `url("${icon}")` }} aria-hidden="true" />
                    <span className={styles.outbound} aria-hidden="true">↗</span>
                  </div>
                  <h2>{website.name}</h2>
                  <span className={styles.url}>{new URL(website.url).hostname}</span>
                  <p>{website.description}</p>
                </a>
                {canAdd && <AdminActions id={website.id} name={website.name} />}
              </div>
            );
          })}
        </div>

        {pageCount > 1 && (
          <nav className={styles.pagination} aria-label="Pagination">
            {page > 1 && <a href={`/directory?page=${page - 1}`}>Prev</a>}
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <a
                key={number}
                href={`/directory?page=${number}`}
                aria-current={number === page ? "page" : undefined}
                className={number === page ? styles.currentPage : undefined}
              >
                {number}
              </a>
            ))}
            {page < pageCount && <a href={`/directory?page=${page + 1}`}>Next</a>}
          </nav>
        )}
      </main>
    </>
  );
}
