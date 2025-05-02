import type { AppLog } from "@prisma/client";
import { usePaginatedResults } from "~/lib/use-paginated-results";
import { LoadingButton } from "./loading-button";

async function fetchAppLogs(prevResults: AppLog[][]) {
	const lastTimestamp = prevResults.at(-1)?.at(-1)?.timestamp;
	const lastTime = lastTimestamp
		? new Date(lastTimestamp).getTime()
		: Date.now();
	const res = await fetch(`/logs?type=app&timestamp__lt=${lastTime}`);
	const { logs } = await res.json();

	return logs as AppLog[];
}

export function AppLogsTable() {
	const { results, next, isLoading } = usePaginatedResults(fetchAppLogs);

	const flattened = results.flat();
	const done = results.at(-1)?.length === 0;

	return (
		<div className="flex bg-zinc-50 dark:(bg-neutral-900 border-neutral-700) flex-1 h-0 border-t">
			<div className="flex-1 h-full">
				<div className="h-full overflow-y-auto">
					<table className="w-full">
						<thead className="sticky top-0 bg-zinc-50 dark:(bg-neutral-900 border-neutral-700)">
							<tr className="border-b dark:border-neutral-800">
								<th className="text-sm text-secondary text-start font-normal px-2 py-1 w-40">
									Time
								</th>
								<th className="text-sm text-secondary text-start font-normal px-2 py-1 w-24">
									Level
								</th>
								<th className="text-sm text-secondary text-start font-normal px-2 py-1">
									Message
								</th>
								<th className="text-sm text-secondary text-start font-normal px-2 py-1 w-64">
									Session
								</th>
								<th className="text-sm text-secondary text-start font-normal px-2 py-1 w-14 text-end">
									Duration
								</th>
							</tr>
						</thead>

						<tbody>
							{flattened.map((it) => (
								<tr
									className="hover:bg-zinc-100 dark:hover:bg-neutral-800 cursor-pointer"
									key={it.id}
								>
									<td className="text-sm font-mono px-2 py-1">
										May 1 09:25.<span className="text-secondary">00</span>
									</td>
									<td className=".text-sm font-mono px-2 py-1">{it.level}</td>
									<td className=".text-sm font-mono px-2 py-1">{it.message}</td>
									<td className=".text-sm font-mono px-2 py-1">
										{it.sessionId}
									</td>
									<td className=".text-sm font-mono px-2 py-1 text-end">
										{it.duration}
										<span className="text-secondary">ms</span>
									</td>
								</tr>
							))}
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
