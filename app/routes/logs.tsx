import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";
import { unauthorized } from "~/lib/responses";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const type = url.searchParams.get("type");
	const lastTime = Number(url.searchParams.get("timestamp__lt"));

	switch (type) {
		case "request": {
			const logs = await prisma.requestLog.findMany({
				where: {
					timestamp: { lt: new Date(lastTime) },
				},
				orderBy: { timestamp: "desc" },
				take: 100,
			});

			return { logs };
		}

		case "app": {
			const logs = await prisma.appLog.findMany({
				where: {
					timestamp: { lt: new Date(lastTime) },
				},
				orderBy: { timestamp: "desc" },
				take: 100,
			});

			return { logs };
		}
	}

	return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.json();
	const token = request.headers.get("Authorization");

	if (token !== process.env.APP_TOKEN) {
		throw unauthorized();
	}

	const { type, ...data } = formData;

	switch (type) {
		case "request":
			await prisma.requestLog.create({
				data,
			});
			break;

		case "app":
			await prisma.appLog.create({
				data,
			});
			break;
	}

	return { success: true };
};
