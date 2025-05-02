import clsx from "clsx";
import React from "react";
import { useForm } from "react-hook-form";
import { useFetcher } from "react-router-dom";
import { Button } from "./button";
import { Input } from "./input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	usePopoverContext,
} from "./popover";

export function AddApp() {
	return (
		<Popover placement="right-end">
			<PopoverTrigger className="items-center flex gap-2 px-2 py-1 rounded-lg dark:bg-neutral-800">
				<div className="i-lucide-plus" />
				Add app
			</PopoverTrigger>
			<PopoverContent>
				<AddAppForm />
			</PopoverContent>
		</Popover>
	);
}

const NON_WORD_REGEX = /[^a-zA-Z0-9]+/g;
const CONSECUTIVE_DASHES_REGEX = /^-+|-+$/g;

function AddAppForm() {
	const { register, handleSubmit, watch } = useForm({
		defaultValues: {
			name: "",
			slug: "",
		},
	});
	const fetcher = useFetcher();
	const popover = usePopoverContext();

	const $name = watch("name");
	const slugPlaceholder = $name.trim()
		? $name
				.trim()
				.toLowerCase()
				.replace(NON_WORD_REGEX, "-")
				.replace(CONSECUTIVE_DASHES_REGEX, "-")
		: "Slug";

	function onSubmit(data: any) {
		const slug = data.slug.trim() || slugPlaceholder;

		if (!slug) return;

		fetcher.submit(JSON.stringify({ slug, name: data.name }), {
			method: "POST",
			encType: "application/json",
			action: "/app",
		});
	}

	React.useEffect(() => {
		if (fetcher.data) {
			popover.setOpen(false);
		}
	}, [fetcher.data, popover]);

	return (
		<div className="w-17rem p-2 border border-neutral-200 dark:(border-neutral-700 bg-neutral-900) bg-zinc-50 rounded-lg shadow-lg">
			<h2 className="text-sm font-medium mb-2">Add app</h2>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
				<div>
					<Input
						placeholder="App name"
						{...register("name", { required: true })}
					/>
				</div>

				<div>
					<Input
						placeholder={slugPlaceholder}
						className="font-mono"
						{...register("slug")}
					/>
					<div className="text-xs text-secondary">
						This will be used to identify this app in API calls.
					</div>
				</div>

				<div className="mt-4">
					<Button type="submit" disabled={fetcher.state === "submitting"}>
						<div
							className={clsx("i-lucide-plus", {
								"i-svg-spinners-270-ring": fetcher.state === "submitting",
							})}
						/>
						Create app
					</Button>
				</div>
			</form>
		</div>
	);
}
