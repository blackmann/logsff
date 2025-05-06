import { startOfDay } from "date-fns";
import { useForm } from "react-hook-form";
import React from "react";
import { Input } from "./input";
import { Select } from "./select";

interface FilterForm {
	query: string;
	timeRange: "45d" | "48h";
	maxDate: Date;
}

interface FilterProps {
	onFilterChange: (filters: FilterForm) => void;
}

export function Filter({ onFilterChange }: FilterProps) {
	const maxDate = startOfDay(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000));
	const { register, watch } = useForm<FilterForm>({
		defaultValues: { query: "", timeRange: "45d", maxDate },
	});

	React.useEffect(() => {
		let timer: NodeJS.Timeout;
		const subscription = watch((value) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				onFilterChange({
					query: value.query || "",
					timeRange: value.timeRange as "45d" | "48h",
					maxDate: value.maxDate ? new Date(value.maxDate) : maxDate,
				});
			}, 300);
		});

		return () => {
			subscription.unsubscribe();
			clearTimeout(timer);
		};
	}, [watch, onFilterChange, maxDate]);

	return (
		<div className="flex gap-2 items-center border-t px-2 py-4 dark:border-neutral-700">
			<Input
				className="font-mono py-2"
				placeholder="{ }"
				{...register("query")}
			/>

			<div className="flex items-center border rounded-lg divide-x dark:border-neutral-700">
				<Select
					className="py-2 rounded-e-0 border-0 font-mono !w-6rem"
					{...register("timeRange")}
				>
					<option value="45d">45d</option>
					<option value="48h">48h</option>
				</Select>

				<Input
					type="date"
					className="py-2 rounded-s-0 border-0 font-mono"
					max={maxDate.toISOString().split("T")[0]}
					{...register("maxDate")}
				/>
			</div>
		</div>
	);
}
