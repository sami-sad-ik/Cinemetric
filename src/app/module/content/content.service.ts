import { content } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createContent = async (payload: content): Promise<content> => {
  const contentData = await prisma.content.create({
    data: payload,
  });
  return contentData;
};

const getAllContent = async (): Promise<content[]> => {
  const contentData = await prisma.content.findMany();
  return contentData;
};

const deleteContent = async (id: string): Promise<content | null> => {
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
