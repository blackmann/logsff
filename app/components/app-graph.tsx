import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { format } from "date-fns";
import type { TooltipProps } from "recharts";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { loader } from "~/routes/app.$app.logs";

interface LogData {
	date: Date;
	count_info: number;
	count_warn: number;
	count_error: number;
}

interface TooltipEntry {
	name: string;
	value: number;
	color: string;
}

// Generate dummy data for the last 40 days
const generateDummyData = (): LogData[] => {
	const data: LogData[] = [];
	const today = new Date();

	for (let i = 39; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);

		data.push({
			date,
			count_info: Math.floor(Math.random() * 1000) + 500,
			count_warn: Math.floor(Math.random() * 200) + 100,
			count_error: Math.floor(Math.random() * 100) + 50,
		});
	}

	return data;
};

const data = generateDummyData();

// Custom tooltip component
const CustomTooltip = ({
	active,
	payload,
	label,
}: TooltipProps<number, string>) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-zinc-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl w-12rem">
				<div className="flex p-2">
					<div className="bg-zinc-100 dark:bg-neutral-800 text-sm px-2 rounded-lg flex items-center gap-2 font-medium">
						<div className="i-lucide-calendar text-secondary" />
						{format(new Date(label), "d MMM yyyy")}
					</div>
				</div>

				<div className="p-2 bg-zinc-200/40 dark:bg-neutral-800 rounded-lg">
					{payload.map((entry) => (
						<div className="flex items-center gap-2" key={entry.name}>
							<div
								className={clsx("w-3 h-2 rounded-full")}
								style={{ backgroundColor: entry.color }}
							/>
							<p className="text-sm">{entry.name}</p>
							<p className="text-sm font-mono flex-1 text-end text-secondary">
								{entry.value}
							</p>
						</div>
					))}
				</div>
			</div>
		);
	}
	return null;
};

// Custom tick formatter for XAxis
const formatDateTick = (date: Date) => {
	const d = new Date(date);
	if (d.getDate() === 1) {
		return format(d, "d MMM");
	}
	return format(d, "d");
};

export function AppGraph() {
	const { timeseries } = useLoaderData<typeof loader>();

	return (
		<div className="h-18rem w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={timeseries}
					margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						className="dark:stroke-neutral-700"
					/>
					<XAxis
						dataKey="date"
						tickFormatter={formatDateTick}
						tick={{ fontSize: 12 }}
					/>
					<YAxis
						orientation="right"
						tick={{ fontSize: 12 }}
						className="font-mono"
					/>
					<Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
					<Line
						type="monotone"
						dataKey="count_info"
						name="Info"
						strokeWidth={2}
						stroke="rgb(161 161 170)"
						dot={false}
					/>
					<Line
						type="monotone"
						dataKey="count_warn"
						name="Warn"
						stroke="rgb(250 204 21)"
						strokeWidth={2}
						dot={false}
					/>
					<Line
						type="monotone"
						dataKey="count_error"
						name="Error"
						stroke="rgb(239 68 68)"
						strokeWidth={2}
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
