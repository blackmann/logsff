import type { LoaderFunctionArgs } from "@remix-run/node";
import { checkAuth } from "~/lib/check-auth";
import { prisma } from "~/lib/prisma.server";
import { notFound } from "~/lib/responses";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	await checkAuth(request);

	const { id } = params;

	const log = await prisma.requestLog.findFirst({
		where: { id: Number(id) },
	});

	if (!log) {
		throw notFound({ detail: "Log not found" });
	}

	return { log };
};
