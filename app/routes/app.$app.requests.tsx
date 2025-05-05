import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Filter } from "~/components/filter";
import { RequestsGraph } from "~/components/requests-graph";
import { RequestLogsTable } from "~/components/requests-logs";
import { RequestsSum } from "~/components/requests-sum";
import { getRequestsSummary } from "~/lib/get-requests-summary";
import {
	getQueryOpts,
	getRequestsTimeseries,
} from "~/lib/get-requests-timeseries";
import { getWorkTimeData } from "~/lib/get-worktime-data";
import { prisma } from "~/lib/prisma.server";
import { notFound } from "~/lib/responses";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
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

	const timeseries = await getRequestsTimeseries({
		slug: app.slug,
		...opts,
	});

	const summary = await getRequestsSummary({
		slug: app.slug,
		...opts,
	});

	const workTimeData = await getWorkTimeData(app.slug);

	return { app, timeseries, summary, workTimeData };
};

export const meta: MetaFunction = () => {
	return [
		{
			title: "Requests",
		},
	];
};

export default function Requests() {
	return (
		<>
			<RequestsSum />
			<RequestsGraph />
			<Filter />
			<RequestLogsTable />
		</>
	);
}
