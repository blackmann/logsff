import type { RequestLog } from "@prisma/client";
import { useParams } from "@remix-run/react";
import clsx from "clsx";
import { format, formatDate } from "date-fns";
import React from "react";
import { useFetcher } from "react-router-dom";
import { usePaginatedResults } from "~/lib/use-paginated-results";
import { LoadingButton } from "./loading-button";

async function fetchRequestLogs(appId: string, prevResults: RequestLog[][]) {
	const lastTimestamp = prevResults.at(-1)?.at(-1)?.timestamp;
	const lastTime = lastTimestamp
		? new Date(lastTimestamp).getTime()
		: Date.now();

	const res = await fetch(
		`/logs?type=request&timestamp__lt=${lastTime}&appId=${appId}`,
	);
	const { logs } = await res.json();

	return logs as RequestLog[];
}

export function RequestLogsTable() {
	const { app } = useParams();

	const [selectedLog, setSelectedLog] = React.useState<RequestLog | null>(null);

	const fn = React.useCallback(
		(prevResults: RequestLog[][]) => fetchRequestLogs(app!, prevResults),
		[app],
	);

	const { results, next, isLoading } = usePaginatedResults(fn);

	const flattened = results.flat();
	const done = results.at(-1)?.length === 0;

	function select(log: RequestLog) {
		setSelectedLog((prev) => {
			if (prev?.id === log.id) {
				return null;
			}

			return log;
		});
	}

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
								{!selectedLog && (
									<th className="text-sm text-secondary text-start font-normal px-2 py-1 w-24">
										Session ID
									</th>
								)}
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
										className={clsx(
											"hover:bg-zinc-100 dark:hover:bg-neutral-800 cursor-pointer",
											{
												"bg-zinc-100 dark:bg-neutral-800":
													selectedLog?.id === it.id,
											},
										)}
										key={it.id}
										onClick={() => select(it)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												select(it);
											}
										}}
										tabIndex={0}
									>
										<td className="text-sm font-mono px-2 py-1">
											{formatted}.
											<span className="text-secondary">
												{timestamp.getMilliseconds()}
											</span>
										</td>
										<td className="font-mono px-2 py-1">{it.method}</td>
										<td className="font-mono px-2 py-1">{it.path}</td>

										{!selectedLog && (
											<td className="font-mono px-2 py-1">
												<span className="text-secondary">{it.sessionId}</span>
											</td>
										)}
										<td className="font-mono px-2 py-1">
											<span className="text-secondary">{it.status}</span>
										</td>
										<td className="font-mono px-2 py-1 text-end">
											{it.duration}
											<span className="text-secondary">ms</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>

					<div className="flex justify-center my-2">
						<LoadingButton onClick={next} isLoading={isLoading} done={done} />
					</div>
				</div>
			</div>

			<div
				className={clsx(
					"w-0 border-s dark:border-neutral-700 transition-width duration-150 overflow-x-hidden",
					{
						"w-30rem": selectedLog,
					},
				)}
			>
				{selectedLog && (
					<LogDetails log={selectedLog} onClose={() => setSelectedLog(null)} />
				)}
			</div>
		</div>
	);
}

function LogDetails({
	log,
	onClose,
}: { log: RequestLog; onClose: () => void }) {
	const fetcher = useFetcher();

	React.useEffect(() => {
		fetcher.load(`/logs/requests/${log.id}`);
	}, [fetcher.load, log.id]);

	const loaded = fetcher.data?.log;

	return (
		<div>
			<header>
				<div className="flex items-center justify-between gap-2 p-2 pb-0">
					<div className="bg-zinc-100 dark:bg-neutral-800 rounded-full text-secondary px-2 py-1 font-mono text-sm font-medium">
						{formatDate(log.timestamp, "MMM dd, yyyy HH:mm.ss")}
					</div>

					<button
						type="button"
						className="dark:bg-neutral-800 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-neutral-800 text-secondary"
						onClick={onClose}
					>
						<div className="i-lucide-arrow-left" />
					</button>
				</div>

				<div className="px-2 text-base flex gap-2">
					<div className="flex-1">
						<span className="font-mono text-secondary ms-2">{log.method}</span>{" "}
						<span className="font-mono">{log.path}</span>
					</div>

					<div className="flex-1 text-end">
						<span className="font-mono text-secondary">{log.status}</span>
					</div>
				</div>
			</header>

			<div className="my-2">{log.sessionId}</div>

			{loaded?.meta !== undefined && <MetaTable meta={loaded.meta} />}
		</div>
	);
}

function MetaTable({ meta }: { meta: any }) {
	if (meta === null) return null;

	if (typeof meta !== "object") {
		return (
			<_M>
				<div className="font-mono">{meta}</div>
			</_M>
		);
	}

	return (
		<_M>
			<div className="flex flex-col divide-y dark:divide-neutral-800">
				{Object.entries(meta).map(([key, value]) => (
					<div
						key={key}
						className="px-2 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-[background] duration-300"
					>
						<div className="font-mono text-secondary">{key}</div>
						<div className="font-mono text-wrap break-all whitespace-pre-wrap">
							{JSON.stringify(value, null, 2)}
						</div>
					</div>
				))}
			</div>
		</_M>
	);
}

function _M({ children }: React.PropsWithChildren) {
	return (
		<div className="p-2">
			<header>
				<h3 className="text-sm text-secondary ms-2">Meta</h3>
			</header>
			<div className="border rounded-lg dark:border-neutral-800 overflow-hidden">
				{children}
			</div>
		</div>
	);
}
