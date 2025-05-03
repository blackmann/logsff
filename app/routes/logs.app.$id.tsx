import type { LoaderFunctionArgs } from "react-router-dom";
import { checkAuth } from "~/lib/check-auth";
import { prisma } from "~/lib/prisma.server";
import { notFound } from "~/lib/responses";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	await checkAuth(request);
	const { id } = params;

	const log = await prisma.appLog.findUnique({
		where: { id: Number(id) },
	});

	if (!log) {
		throw notFound();
	}

	return { log };
};
