import { Link } from "@remix-run/react";
import clsx from "clsx";
import { useLocation, useParams } from "react-router-dom";

export function NavHeader() {
	const { pathname } = useLocation();

	const params = useParams();

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
							"!border-blue-500/70": isLogs,
							"!border-rose-500/70": isRequests,
						},
					)}
				>
					<Link
						className={clsx("bg-zinc-100 dark:bg-neutral-800 px-2 py-1", {
							"!bg-rose-500 text-white": isRequests,
						})}
						to={`/app/${params.app}/requests`}
					>
						Requests
					</Link>
					<Link
						className={clsx("bg-zinc-100 dark:bg-neutral-800 px-2 py-1", {
							"!bg-blue-500 text-white": isLogs,
						})}
						to={`/app/${params.app}/logs`}
					>
						App Logs
					</Link>
				</div>
			</div>
		</header>
	);
}
