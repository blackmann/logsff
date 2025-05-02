import { startOfDay } from "date-fns";
import { useForm } from "react-hook-form";
import { Input } from "./input";
import { Select } from "./select";

export function Filter() {
	const maxDate = startOfDay(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000));
	const { register } = useForm({ defaultValues: { maxDate } });

	return (
		<div className="flex gap-2 items-center border-t px-2 py-4 dark:border-neutral-700">
			<Input className="font-mono py-2" placeholder="{ }" />

			<div className="flex items-center border rounded-lg divide-x dark:border-neutral-700">
				<Select className="py-2 rounded-e-0 border-0 font-mono !w-6rem">
					<option value="45d">45d</option>
					<option value="48h">48hr</option>
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
