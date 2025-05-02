import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import type { loader } from "~/routes/app.$app.requests";

export function RequestsSum() {
	const { summary } = useLoaderData<typeof loader>();

	const errorRate = (summary.errors / summary.total || 0) * 100;
	return (
		<div className=".bg-zinc-50 dark:(bg-neutral-900 border-neutral-700) grid grid-cols-6 divide-x dark:divide-neutral-700 border-b dark:border-neutral-700">
			<div className="col-span-1">
				<div className="p-3">
					<div className="flex">
						<div className="text-blue-500 bg-blue-50 dark:bg-blue-600/10 rounded-lg px-2">
							Total Requests
						</div>
					</div>
					<div className="font-mono ps-2">
						{summary.total.toLocaleString()}{" "}
						<span className="text-sm text-green-500 inline-flex items-center">
							<div className="i-lucide-arrow-up" />
							21%
						</span>
					</div>

					<div className="text-sm text-secondary px-2">
						Avg 7req/min in the past hour
					</div>
				</div>
			</div>
			<div className="col-span-1">
				<div className="p-3">
					<div className="flex">
						<div className=".text-sm text-orange-500 bg-orange-200/30 dark:bg-orange-600/10 rounded-lg px-2">
							Error Rate
						</div>
					</div>
					<p className=" font-mono px-2">{errorRate.toFixed(1)}%</p>
					<div className="text-sm text-secondary px-2">
						{summary.errors.toLocaleString()} non ok responses during this
						period.
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
						1 Mar <span className="text-secondary">to</span> 31 Mar 2025
					</div>
					<div className="text-sm text-secondary">45d</div>
				</div>
			</div>
		</div>
	);
}

function WorkTime() {
	return (
		<div className="p-2">
			<div className="text-sm text-secondary">Work time</div>
			<div className="flex gap-.5">
				{Array.from({ length: 24 }).map((_, i) => (
					<div
						key={i}
						className={clsx("w-2 h-6 bg-green-500 rounded", {
							"bg-neutral-300 dark:bg-neutral-700": [4, 8, 9, 19].includes(i),
						})}
					/>
				))}
			</div>

			<p className="text-xs text-secondary leading-none mt-2">
				This measures if the server made at least one request in each hour.
			</p>
		</div>
	);
}
