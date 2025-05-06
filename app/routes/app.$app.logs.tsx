import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { startOfDay } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { AppGraph } from "~/components/app-graph";
import { AppLogsTable } from "~/components/app-logs";
import { AppsSum } from "~/components/apps-sum";
import { Filter } from "~/components/filter";
import { getAppSummary } from "~/lib/get-app-summary";
import { getAppTimeseries } from "~/lib/get-app-timeseries";
import { getQueryOpts } from "~/lib/get-requests-timeseries";
import { prisma } from "~/lib/prisma.server";
import type { FilterForm } from "~/lib/request-filter";
import { notFound } from "~/lib/responses";
import React from "react";
import { getAppWorkTime } from "~/lib/get-app-worktime";

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

	const worktime = await getAppWorkTime(app.slug);

	return { app, timeseries, summary, worktime, opts };
};

export const meta: MetaFunction = () => {
	return [
		{
			title: "Logs",
		},
	];
};

export default function Logs() {
	const [searchParams, setSearchParams] = useSearchParams();

	const filters = React.useMemo<FilterForm>(
		() => ({
			query: searchParams.get("query") || "",
			timeRange: (searchParams.get("period") as "45d" | "48h") || "45d",
			maxDate: searchParams.get("start")
				? new Date(searchParams.get("start")!)
				: startOfDay(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)),
		}),
		[searchParams],
	);

	const handleFilterChange = React.useCallback(
		(updated: FilterForm) => {
			setSearchParams({
				query: updated.query,
				period: updated.timeRange,
				start: updated.maxDate.toISOString().split("T")[0],
			});
		},
		[setSearchParams],
	);

	return (
		<>
			<AppsSum />
			<AppGraph />
			<Filter onFilterChange={handleFilterChange} />
			<AppLogsTable filters={filters} />
		</>
	);
}
