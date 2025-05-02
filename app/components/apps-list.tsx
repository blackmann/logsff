import { Link, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import React from "react";
import type { loader } from "~/routes/app";
import { AddApp } from "./add-app";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	usePopoverContext,
} from "./popover";

export function AppsList() {
	const { apps } = useLoaderData<typeof loader>();

	return (
		<nav className="py-2">
			<header className="text-sm px-2 text-secondary flex justify-between items-center">
				<div>Apps ({apps.length})</div>
				<div>
					<AddApp />
				</div>
			</header>
			<ul className="p-2">
				{apps.map((app) => (
					<li key={app.slug}>
						<div className="group flex gap-2 items-center rounded-lg hover:bg-zinc-100 dark:hover:bg-neutral-800">
							<Link
								to={`/app/${app.slug}/logs`}
								className="flex-1 flex gap-2 items-center p-2"
							>
								<div className="i-lucide-box text-secondary" />{" "}
								<span>{app.name}</span>
							</Link>

							<div className="flex items-center p-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-200 dark:bg-neutral-700/50 rounded-e-lg text-secondary">
								<DeleteButton app={app} />
							</div>
						</div>
					</li>
				))}
			</ul>
		</nav>
	);
}

interface DeleteProps {
	app: { name: string; slug: string };
}

function DeleteButton({ app }: DeleteProps) {
	return (
		<Popover placement="right-start" offset={17}>
			<PopoverTrigger className="bg-transparent">
				<div className="i-lucide-trash" />
			</PopoverTrigger>
			<PopoverContent>
				<DeleteAppDialog app={app} />
			</PopoverContent>
		</Popover>
	);
}

function DeleteAppDialog({ app }: DeleteProps) {
	const fetcher = useFetcher();
	const popover = usePopoverContext();
	const navigate = useNavigate();

	function deleteApp() {
		fetcher.submit(null, {
			method: "DELETE",
			action: `/app/${app.slug}`,
		});
	}

	React.useEffect(() => {
		if (fetcher.data) {
			popover.setOpen(false);
			navigate("/");
		}
	}, [fetcher.data, popover, navigate]);

	return (
		<div className="p-2 bg-zinc-50 dark:(bg-neutral-900 border-neutral-700) rounded-lg shadow-lg w-15rem border shadow-lg">
			<header className="text-sm font-medium mb-1">
				Delete <span className="font-mono text-rose-500">{app.name}</span>?
			</header>
			<p className="mb-1 text-sm text-secondary">
				Are you sure you want to delete this app? This will delete all
				associated logs.
			</p>
			<button
				type="button"
				className="bg-rose-500 text-white px-2 py-0.5 rounded-md font-mono text-sm"
				onClick={deleteApp}
				disabled={fetcher.state === "submitting"}
			>
				{fetcher.state === "submitting" ? "Deleting…" : "Si, patron"}
			</button>
		</div>
	);
}
