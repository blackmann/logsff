import { PrismaClient } from "@prisma/client"; // Add at least one model then run `yarn prisma generate`
import { makeSingleton } from "./singleton";

const prisma = makeSingleton("prisma", () => {
	const prisma = new PrismaClient();
	prisma.$connect();

	return prisma;
});

export { prisma };
