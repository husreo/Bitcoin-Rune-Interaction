import { PrismaClient } from "@prisma/client";
import { createPaginator } from "prisma-pagination";

const prisma = new PrismaClient();
const paginate = createPaginator({});

export { prisma, paginate };
