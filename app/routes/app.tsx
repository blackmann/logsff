import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { AppsList } from "~/components/apps-list";
import { NavHeader } from "~/components/nav-header";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const apps = await prisma.app.findMany();

	return { apps };
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.json();
	const app = await prisma.app.create({ data: formData });

	return { app };
};

export default function AppLayout() {
	return (
		<div className="grid grid-cols-5 h-screen">
			<div className="col-span-1 h-full border-e bg-zinc-50 dark:(bg-neutral-900 border-neutral-700)">
				<NavHeader />
				<AppsList />
			</div>
			<div className="col-span-4 h-screen dark:bg-neutral-800">
				<div className="flex flex-col h-full">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
