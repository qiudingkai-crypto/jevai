CREATE TABLE "DirectoryWebsite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "iconUrl" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DirectoryWebsite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DirectoryWebsite_url_key" ON "DirectoryWebsite"("url");

INSERT INTO "DirectoryWebsite" ("id", "name", "url", "iconUrl", "description") VALUES
  ('01-jev-search', 'Jev Search', 'https://jev.s1.dev/', 'https://jev.s1.dev/favicon.png', 'Search and filter relevant web pages and developer profiles by entering what you are looking for.'),
  ('02-maker-map', 'Maker Map', 'https://makermap.lol/', 'https://makermap.lol/favicon.svg', 'Discover creators worth knowing based on their profiles and interests.'),
  ('03-typesafe-playground', 'TypeSafe Community Playground', 'https://typesafe-ai-playground.vercel.app/', 'https://typesafe-ai-playground.vercel.app/icon.jpg?icon.0-97r9iqohehd.jpg', 'Try Jev on text, workflows, code, and games in an interactive online playground.'),
  ('04-jevform', 'Jevform', 'https://jevform.spiritt.app/', 'https://jevform.spiritt.app/spiritt/favicon.ico', 'An adaptive form that changes follow-up questions based on your answers.')
ON CONFLICT ("url") DO NOTHING;
