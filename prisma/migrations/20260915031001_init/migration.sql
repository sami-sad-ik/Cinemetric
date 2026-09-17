-- CreateEnum
CREATE TYPE "contentType" AS ENUM ('movie', 'series');

-- CreateEnum
CREATE TYPE "contentGenre" AS ENUM ('action', 'comedy', 'drama', 'fantasy', 'horror', 'mystery', 'romance', 'thriller', 'family');

-- CreateEnum
CREATE TYPE "streamingPlatform" AS ENUM ('netflix', 'disneyPlus', 'amazonPrime', 'appleTvPlus');

-- CreateEnum
CREATE TYPE "PriceTier" AS ENUM ('FREE', 'PREMIUM');

-- CreateTable
CREATE TABLE "contents" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "type" "contentType" NOT NULL,
    "genre" "contentGenre"[],
    "releaseYear" INTEGER NOT NULL,
    "synopsis" VARCHAR(500) NOT NULL,
    "director" VARCHAR(100) NOT NULL,
    "streamingPlatform" "streamingPlatform"[],
    "priceTier" "PriceTier" NOT NULL DEFAULT 'FREE',
    "cast" VARCHAR(100)[],
    "youtubeVideoId" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_title" ON "contents"("title");
