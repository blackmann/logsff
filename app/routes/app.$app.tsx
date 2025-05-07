import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
} from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const path = url.pathname.replace(/\/$/, "");

	if (path === `/app/${params.app}`) {
		return redirect(`/app/${params.app}/requests`);
	}

	return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
	if (request.method === "DELETE") {
		const slug = params.app;
		await prisma.app.delete({ where: { slug } });

		return redirect("/app");
	}

	return null;
};
