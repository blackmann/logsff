import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
	if (request.method === "DELETE") {
		const slug = params.app;
		await prisma.app.delete({ where: { slug } });

		return redirect("/app");
	}

  return null
};
