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
	const lastTime = lastTimestamp
		? new Date(lastTimestamp).getTime()
		: Date.now();

	const params = new URLSearchParams({
		type,
		timestamp__lt: lastTime.toString(),
		appId,
		...(filters.query && { query: filters.query }),
		timeRange: filters.timeRange,
		maxDate: filters.maxDate.toISOString(),
	});

	const res = await fetch(`/logs?${params}`);
	const { logs } = await res.json();

	return logs as LogType<T>;
}

export { fetchLogs };
