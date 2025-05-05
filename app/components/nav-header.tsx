import { Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { useLocation, useParams } from "react-router-dom";
import type { loader } from "~/routes/app";

export function NavHeader() {
	const { apps } = useLoaderData<typeof loader>();
	const appCount = apps.length;

	const { pathname } = useLocation();

	const params = useParams();
	const appId = params.app;

	const isRequests = pathname.includes("/requests");
	const isLogs = pathname.includes("/logs");

	return (
		<header className="p-2 border-b dark:border-neutral-700">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2 font-bold text-violet-500 font-mono">
					<div className="text-xl bg-violet-500/10 rounded-lg p-1">
						<div className="i-lucide-container" />
					</div>{" "}
					logsff
				</div>

				<div
					className={clsx(
						"flex text-sm font-mono border rounded-lg divide-x dark:(border-neutral-700 divide-neutral-700) overflow-hidden",
						{
							"!border-blue-500/70": isLogs && appCount > 0 && appId,
							"!border-rose-500/70": isRequests && appCount > 0 && appId,
						},
					)}
				>
					{appCount > 0 && appId ? (
						<>
							<Link
								className={clsx("bg-zinc-100 dark:bg-neutral-800 px-2 py-1", {
									"!bg-rose-500 text-white": isRequests,
								})}
								to={`/app/${appId}/requests`}
							>
								Requests
							</Link>
							<Link
								className={clsx("bg-zinc-100 dark:bg-neutral-800 px-2 py-1", {
									"!bg-blue-500 text-white": isLogs,
								})}
								to={`/app/${appId}/logs`}
							>
								App Logs
							</Link>
						</>
					) : (
						<span className="bg-zinc-100 dark:bg-neutral-800 px-2 py-1 text-gray-500">
							{appCount === 0
								? "Add an app to view logs"
								: "Select an app to view logs"}
						</span>
					)}
				</div>
			</div>
		</header>
	);
}
