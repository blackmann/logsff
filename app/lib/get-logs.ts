import type { AppLog, RequestLog } from "@prisma/client";
import type { FilterForm } from "./request-filter";

interface FetchOpts {
	type: "request" | "app";
	appId: string;
	prevResults: RequestLog[][] | AppLog[][];
	filters: FilterForm;
}

type LogType<T extends "request" | "app"> = T extends "request"
	? RequestLog[]
	: AppLog[];

async function fetchLogs<T extends "request" | "app">({
	prevResults,
	filters,
	appId,
	type,
}: FetchOpts & { type: T }): Promise<LogType<T>> {
	const lastTimestamp = prevResults.at(-1)?.at(-1)?.timestamp;
	let lastTime: number;

	if (lastTimestamp) {
		lastTime = new Date(lastTimestamp).getTime();
	} else {
		const maxDate = filters.maxDate || new Date();
		const durationMs =
			filters.timeRange === "48h"
				? 48 * 60 * 60 * 1000
				: 45 * 24 * 60 * 60 * 1000;

		lastTime = new Date(maxDate.getTime() + durationMs).getTime();
	}

	const params = new URLSearchParams({
		type,
		timestamp__lt: lastTime.toString(),
		appId,
		...(filters.query ? { query: filters.query } : {}),
		timeRange: filters.timeRange,
		...(filters.maxDate ? { maxDate: filters.maxDate.toISOString() } : {}),
	});


	const res = await fetch(`/logs?${params}`);
	const { logs } = await res.json();

	return logs as LogType<T>;
}

export { fetchLogs };
