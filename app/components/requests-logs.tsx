import type { RequestLog } from "@prisma/client";
import { format } from "date-fns";
import { usePaginatedResults } from "~/lib/use-paginated-results";
import { LoadingButton } from "./loading-button";

async function fetchRequestLogs(prevResults: RequestLog[][]) {
	const lastTimestamp = prevResults.at(-1)?.at(-1)?.timestamp;
	const lastTime = lastTimestamp
		? new Date(lastTimestamp).getTime()
		: Date.now();
	const res = await fetch(`/logs?type=request&timestamp__lt=${lastTime}`);
	const { logs } = await res.json();

	return logs as RequestLog[];
}

export function RequestLogsTable() {
	const { results, next, isLoading } = usePaginatedResults(fetchRequestLogs);

	const flattened = results.flat();
	const done = results.at(-1)?.length === 0;

	return (
		<div className="flex bg-zinc-50 dark:(bg-neutral-900 border-neutral-700) flex-1 h-0 border-t">
			<div className="flex-1 h-full">
				<div className="h-full overflow-y-auto">
					<table className="w-full">
						<thead className="sticky top-0 bg-zinc-50 dark:(bg-neutral-900 border-neutral-700)">
							<tr className="border-b dark:border-neutral-800">
								<th className="text-sm text-secondary text-start font-normal px-2 py-1 w-46">
									Time
								</th>
								<th className="text-sm text-secondary text-start font-normal px-2 py-1 w-24">
									Method
								</th>
								<th className="text-sm text-secondary text-start font-normal px-2 py-1">
									Path
								</th>
								<th className="text-sm text-secondary text-start font-normal px-2 py-1 w-24">
									Status
								</th>
								<th className="text-sm text-secondary text-start font-normal px-2 py-1 w-14 text-end">
									Duration
								</th>
							</tr>
						</thead>

						<tbody>
							{flattened.map((it) => {
								const timestamp = new Date(it.timestamp);
								const formatted = format(timestamp, "MMM d HH:mm.ss");

								return (
									<tr
										className="hover:bg-zinc-100 dark:hover:bg-neutral-800 cursor-pointer"
										key={it.id}
									>
										<td className="text-sm font-mono px-2 py-1">
											{formatted}.
											<span className="text-secondary">
												{timestamp.getMilliseconds()}
											</span>
										</td>
										<td className=".text-sm font-mono px-2 py-1">
											{it.method}
										</td>
										<td className=".text-sm font-mono px-2 py-1">{it.path}</td>
										<td className=".text-sm font-mono px-2 py-1">
											<span className="text-secondary">{it.status}</span>
										</td>
										<td className=".text-sm font-mono px-2 py-1 text-end">
											{it.duration}
											<span className="text-secondary">ms</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>

					<div className="flex justify-center mt-4">
						<LoadingButton onClick={next} isLoading={isLoading} done={done} />
					</div>
				</div>
			</div>

			{/* <div className="w-30rem border-s dark:border-neutral-700">
				<header>Details</header>
			</div> */}
		</div>
	);
}
