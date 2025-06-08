import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, redirect } from "@remix-run/react";
import { AppsList } from "~/components/apps-list";
import { NavHeader } from "~/components/nav-header";
import { checkAuth } from "~/lib/check-auth";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	try {
		const user = await checkAuth(request);
		const apps = await prisma.app.findMany();

		const url = new URL(request.url);
		const path = url.pathname.replace(/\/$/, "");

		if (path === "/app" && apps.length > 0) {
			return redirect(`/app/${apps[0].slug}/requests`);
		}

		return { apps, user };
	} catch (error) {
		return redirect("/login");
	}
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.json();
	const app = await prisma.app.create({ data: formData });

	return { app };
};

export default function AppLayout() {
	return (
		<div className="flex h-screen">
			<div className="w-78 h-screen border-e bg-zinc-50 dark:(bg-neutral-900 border-neutral-700) flex flex-col">
				<NavHeader />
				<AppsList />
			</div>
			<div className="flex-1 h-screen dark:bg-neutral-800">
				<div className="flex flex-col h-full">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
