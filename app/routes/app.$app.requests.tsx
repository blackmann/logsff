import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import React from "react";
import { json, useSearchParams } from "@remix-run/react";
import { Filter } from "~/components/filter";
import { RequestsGraph } from "~/components/requests-graph";
import { RequestLogsTable } from "~/components/requests-logs";
import { RequestsSum } from "~/components/requests-sum";
import { getRequestsSummary } from "~/lib/get-requests-summary";
import {
	getQueryOpts,
	getRequestsTimeseries,
} from "~/lib/get-requests-timeseries";
import { getRequestWorkTime } from "~/lib/get-requests-worktime";
import { prisma } from "~/lib/prisma.server";
import { notFound } from "~/lib/responses";
import type { FilterForm } from "~/lib/request-filter";
import { lastAppCookie } from "~/lib/cookies.server";
import { getLastAppRedirect } from "~/lib/get-last-app";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const app = await prisma.app.findUnique({
		where: { slug: params.app },
	});

	if (!app) {
		throw notFound();
	}

	const { lastApp } = await getLastAppRedirect(request);

	let currentApp: string | undefined;
	if (lastApp?.app !== params.app) {
		currentApp = await lastAppCookie.serialize({ app: params.app });
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

	const worktime = await getRequestWorkTime(app.slug);

	return json(
		{ app, timeseries, summary, worktime, opts },
		currentApp
			? {
					headers: {
						"Set-Cookie": currentApp,
					},
				}
			: undefined,
	);
};

export const meta: MetaFunction = () => {
	return [
		{
			title: "Requests",
		},
	];
};

export default function Requests() {
	const [searchParams, setSearchParams] = useSearchParams();

	const filters = React.useMemo<FilterForm>(
		() => ({
			query: searchParams.get("query") || "",
			timeRange: (searchParams.get("period") as "45d" | "48h") || "45d",
			maxDate: searchParams.get("start")
				? new Date(searchParams.get("start")!)
				: undefined,
		}),
		[searchParams],
	);

	const handleFilterChange = React.useCallback(
		(updated: FilterForm) => {
			const params: Record<string, string> = {
				query: updated.query,
				period: updated.timeRange,
			};
			if (updated.maxDate) {
				params.start = updated.maxDate.toISOString().split("T")[0];
			}
			setSearchParams(params);
		},
		[setSearchParams],
	);

	return (
		<>
			<RequestsSum />
			<RequestsGraph />
			<Filter onFilterChange={handleFilterChange} searchParams={searchParams} />
			<RequestLogsTable filters={filters} />
		</>
	);
}
