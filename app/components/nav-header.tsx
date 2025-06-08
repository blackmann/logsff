import { Link } from "@remix-run/react";
import clsx from "clsx";
import { useLocation, useParams } from "react-router-dom";

export function NavHeader() {
	const { pathname } = useLocation();

	const params = useParams();
	const appId = params.app;

	const segments = pathname.split("/").filter(Boolean);
	const lastSegment = segments[segments.length - 1];

	const isRequests = lastSegment === "requests";
	const isLogs = lastSegment === "logs";

	return (
		<header className="p-2 border-b dark:border-neutral-700">
			<div className="flex max-xl:flex-col gap-2 justify-between items-center">
				<div className="flex items-center gap-2 font-bold text-violet-500 font-mono">
					<div className="text-xl bg-violet-500/10 rounded-lg p-1">
						<div className="i-lucide-container" />
					</div>{" "}
					logsff
				</div>

				{appId && (
					<div
						className={clsx(
							"flex text-sm font-mono border rounded-lg divide-x dark:(border-neutral-700 divide-neutral-700) overflow-hidden",
							{
								"!border-blue-500": isLogs && appId,
								"!border-rose-500": isRequests && appId,
							},
						)}
					>
						<Link
							className={clsx("bg-zinc-100 dark:bg-neutral-800 px-3 py-1.5", {
								"!bg-rose-500 text-white": isRequests,
							})}
							to={`/app/${appId}/requests`}
						>
							Requests
						</Link>
						<Link
							className={clsx("bg-zinc-100 dark:bg-neutral-800 px-3 py-1.5", {
								"!bg-blue-500 text-white": isLogs,
							})}
							to={`/app/${appId}/logs`}
						>
							App Logs
						</Link>
					</div>
				)}
			</div>
		</header>
	);
}
