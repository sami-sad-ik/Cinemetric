import { Content } from "../../../generated/prisma/schema/client";
import { prisma } from "../../lib/prisma";

const createContent = async (payload: Content): Promise<Content> => {
  const contentData = await prisma.content.create({
    data: payload,
  });
  return contentData;
};

const getAllContent = async (): Promise<Content[]> => {
  const contentData = await prisma.content.findMany();
  return contentData;
};

const deleteContent = async (id: string): Promise<Content | null> => {
  const contentData = await prisma.content.delete({
    where: { id },
  });
  return contentData;
};

export const contentService = {
  createContent,
  getAllContent,
  deleteContent,
};
