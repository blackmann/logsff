import type { MetaFunction } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export const loader = async () => {
	const apps = await prisma.app.findMany();

	return { apps };
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
