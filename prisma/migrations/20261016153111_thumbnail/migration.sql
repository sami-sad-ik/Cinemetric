/*
  Warnings:

  - Added the required column `thumbnailLink` to the `contents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contents" ADD COLUMN     "thumbnailLink" VARCHAR(500) NOT NULL;
