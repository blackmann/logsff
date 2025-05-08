import {
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
} from "@remix-run/node";
import { checkAuth } from "~/lib/check-auth";
import { getLastAppRedirect } from "~/lib/get-last-app";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	try {
		await checkAuth(request);
	} catch (error) {
		return redirect("/login");
	}

	const { redirectTo, lastApp } = await getLastAppRedirect(request);

	if (lastApp) {
		const app = await prisma.app.findUnique({
			where: { slug: lastApp },
		});

		if (app) {
			return redirect(redirectTo);
		}
	}

	const apps = await prisma.app.findMany();

	return redirect(apps.length ? `/app/${apps[0].slug}/requests` : "/app");
};

export const meta: MetaFunction = () => {
	return [
		{ title: "logsff" },
		{ name: "description", content: "Tailing server logs" },
	];
};

export default function Index() {
	return <div>Hi</div>;
}
