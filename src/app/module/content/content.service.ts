import { Content, Prisma } from "../../../generated/prisma/schema/client";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  contentFilterableFields,
  contentIncludeConfig,
  contentSearchableFields,
} from "./content.constraint";

const createContent = async (payload: Content) => {
  const contentData = await prisma.content.create({
    data: payload,
  });
  return contentData;
};

const getAllContent = async (query: IQueryParams) => {
  // const contentData = await prisma.content.findMany();
  // return contentData;
  const queryBuilder = new QueryBuilder<
    Content,
    Prisma.ContentWhereInput,
    Prisma.ContentInclude
  >(prisma.content, query, {
    searchableFields: contentSearchableFields,
    filterableFields: contentFilterableFields,
  });
  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .sort()
    .fields()
    .include({
      watchlists: true,
      reviews: true,
    })
    .dynamicInclude(contentIncludeConfig)
    .execute();

  return result;
};

const deleteContent = async (id: string) => {
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
