import { startOfDay, format, parse } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import React from "react";
import { Input } from "./input";
import { Select } from "./select";
import { useSearchParams } from "react-router-dom";

interface FilterForm {
	query: string;
	timeRange: "45d" | "48h";
	maxDate?: Date;
}

interface FilterProps {
	onFilterChange: (filters: FilterForm) => void;
}

export function Filter({ onFilterChange }: FilterProps) {
	const [searchParams] = useSearchParams();

	const defaultMaxDate = startOfDay(
		new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
	);

	const { register, watch, control } = useForm<FilterForm>({
		defaultValues: {
			query: searchParams.get("query") || "",
			timeRange: (searchParams.get("period") as "45d" | "48h") || "45d",
			maxDate: searchParams.get("start")
				? parse(searchParams.get("start")!, "yyyy-MM-dd", new Date())
				: undefined,
		},
	});

	React.useEffect(() => {
		let timer: NodeJS.Timeout;
		const subscription = watch((value) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				onFilterChange({
					query: value.query || "",
					timeRange: value.timeRange!,
					maxDate: value.maxDate,
				});
			}, 300);
		});

		return () => {
			subscription.unsubscribe();
			clearTimeout(timer);
		};
	}, [watch, onFilterChange]);

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

				<Controller
					control={control}
					name="maxDate"
					render={({ field: { value, onChange, ...fieldProps } }) => (
						<Input
							type="date"
							className="py-2 rounded-s-0 border-0 font-mono"
							max={format(defaultMaxDate, "yyyy-MM-dd")}
							value={value ? format(value, "yyyy-MM-dd") : ""}
							onChange={(e) => {
								const val = e.target.value;
								onChange(val ? parse(val, "yyyy-MM-dd", new Date()) : null);
							}}
							{...fieldProps}
						/>
					)}
				/>
			</div>
		</div>
	);
}
