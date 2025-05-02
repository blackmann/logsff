import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { AppGraph } from "~/components/app-graph";
import { AppLogsTable } from "~/components/app-logs";
import { AppsSum } from "~/components/apps-sum";
import { Filter } from "~/components/filter";
import { getAppSummary } from "~/lib/get-app-summary";
import { getAppTimeseries } from "~/lib/get-app-timeseries";
import { getQueryOpts } from "~/lib/get-requests-timeseries";
import { prisma } from "~/lib/prisma.server";
import { notFound } from "~/lib/responses";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const app = await prisma.app.findUnique({
		where: { slug: params.app },
	});

	if (!app) {
		throw notFound();
	}
	const url = new URL(request.url);
	const startQuery = url.searchParams.get("start");
	const periodQuery = url.searchParams.get("period") || "45d";

	const opts = getQueryOpts({
		startDate: startQuery ? new Date(startQuery) : undefined,
		period: periodQuery as "45d" | "48h",
	});

	const timeseries = await getAppTimeseries({
		slug: app.slug,
		...opts,
	});

	const summary = await getAppSummary({
		slug: app.slug,
		...opts,
	});

	return { app, timeseries, summary };
};

export const meta: MetaFunction = () => {
	return [
		{
			title: "Logs",
		},
	];
};

export default function Logs() {
	return (
		<>
			<AppsSum />
			<AppGraph />
			<Filter />
			<AppLogsTable />
		</>
	);
}
