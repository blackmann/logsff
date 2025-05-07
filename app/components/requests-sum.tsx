import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import type { loader } from "~/routes/app.$app.requests";
import { formatHour } from "~/lib/date";
import { format } from "date-fns";
import { calculateRequestMetrics } from "~/lib/requests-summary";
import { Tooltip } from "./tooltip";

export function RequestsSum() {
	const { summary, opts } = useLoaderData<typeof loader>();

	const metrics = calculateRequestMetrics(summary);
	const isIncrease = metrics.percentageChange >= 0;

	return (
		<div className="bg-zinc-50 dark:(bg-neutral-900 border-neutral-700) grid grid-cols-6 divide-x dark:divide-neutral-700 border-b dark:border-neutral-700">
			<div className="col-span-1">
				<div className="p-3">
					<div className="flex">
						<div className="text-blue-500 bg-blue-50 dark:bg-blue-600/10 rounded-lg px-2">
							Total Requests
						</div>
					</div>
					<div className="font-mono ps-2">
						{summary.total.toLocaleString()}{" "}
						{metrics.percentageChange !== 0 && (
							<span
								className={`text-sm ${isIncrease ? "text-green-500" : "text-red-500"} inline-flex items-center`}
							>
								<div
									className={
										isIncrease ? "i-lucide-arrow-up" : "i-lucide-arrow-down"
									}
								/>
								{Math.abs(metrics.percentageChange).toFixed(1)}%
							</span>
						)}
					</div>

					<div className="text-sm text-secondary px-2">
						Avg {metrics.avgRequestsPerMinute.toFixed(1)} req/min in the past
						hour
					</div>
				</div>
			</div>
			<div className="col-span-1">
				<div className="p-3">
					<div className="flex">
						<div className="text-orange-500 bg-orange-200/30 dark:bg-orange-600/10 rounded-lg px-2">
							Error Rate
						</div>
					</div>
					<p className="font-mono px-2">{metrics.errorRate.toFixed(1)}%</p>
					<div className="text-sm text-secondary px-2">
						{summary.errors.toLocaleString()} non ok responses during this
						period
					</div>
				</div>
			</div>

			<div className="col-span-2" />

			<div className="col-span-1">
				<WorkTime />
			</div>

			<div className="col-span-1">
				<div className="p-2">
					<div className="text-sm text-secondary">Showing logs from</div>
					<div className="font-mono text-sm">
						{format(new Date(opts.startDate), "d MMM")}{" "}
						<span className="text-secondary">to</span>{" "}
						{format(new Date(opts.endDate), "d MMM, yyyy")}
					</div>
					<div className="text-sm text-secondary">
						{metrics.formattedPeriod}
					</div>
				</div>
			</div>
		</div>
	);
}

function WorkTime() {
	const { worktime } = useLoaderData<typeof loader>();
	const hourlyActivity = Array(24).fill(false);

	for (const [index, entry] of worktime.entries()) {
		if (entry.count > 0) {
			hourlyActivity[index] = true;
		}
	}

	return (
		<div className="p-2">
			<div className="text-sm text-secondary">Work time (last 24h)</div>
			<div className="flex gap-[2px]">
				{Array.from({ length: 24 }).map((_, i) => (
					<Tooltip
						key={worktime[i]?.timestamp || i}
						content={_Tip(i, worktime, hourlyActivity)}
						placement="top"
					>
						<div
							className={clsx("w-2 cursor-pointer h-6 rounded", {
								"bg-green-500": hourlyActivity[i],
								"bg-neutral-300 dark:bg-neutral-700": !hourlyActivity[i],
							})}
						/>
					</Tooltip>
				))}
			</div>

			<p className="text-xs text-secondary leading-none mt-2">
				This measures if the server made at least one request in each hour.
			</p>
		</div>
	);
}

export function _Tip(
	i: number,
	worktime: { timestamp: string; count: number }[],
	hourlyActivity: boolean[],
) {
	const isActive = hourlyActivity[i];
	const label = formatHour(i, worktime);

	return (
		<div className="flex items-center gap-2">
			<div
				className={clsx("w-2 h-2 rounded-full", {
					"bg-green-500": isActive,
					"bg-neutral-300 dark:bg-neutral-700": !isActive,
				})}
			/>
			<span className="text-sm font-mono">{label}</span>
		</div>
	);
}
