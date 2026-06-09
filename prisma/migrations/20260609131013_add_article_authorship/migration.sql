/*
  Warnings:

  - Added the required column `authorId` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Article" (
    "authorId",
    "body",
    "createdAt",
    "description",
    "id",
    "slug",
    "title",
    "updatedAt"
)
SELECT
    (SELECT MIN("id") FROM "User"),
    "body",
    CURRENT_TIMESTAMP,
    "description",
    "id",
    "slug",
    "title",
    CURRENT_TIMESTAMP
FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
