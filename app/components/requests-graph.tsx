import { useLoaderData, useSearchParams } from "@remix-run/react";
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
import type { loader } from "~/routes/app.$app.requests";

interface RequestData {
	date: Date;
	count_2XX: number;
	count_3XX: number;
	count_4XX: number;
	count_5XX: number;
}

interface TooltipEntry {
	name: string;
	value: number;
	color: string;
}

export function RequestsGraph() {
	const { timeseries } = useLoaderData<typeof loader>();
	const [searchParams] = useSearchParams();
	const period = searchParams.get("period") || "45d";

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
							{period === "48h"
								? format(new Date(label), "d MMM HH:mm")
								: format(new Date(label), "d MMM yyyy")}
						</div>
					</div>
					<div className="p-2 bg-zinc-200/40 dark:bg-neutral-800 rounded-lg">
						{payload.map((entry) => (
							<div className="flex items-center gap-2" key={entry.name}>
								<div
									className="w-3 h-2 rounded-full"
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

	const formatDateTick = (date: string) => {
		if (!date) return "";

		const d = new Date(date);

		if (period === "48h") {
			return format(d, "HH:mm");
		}

		if (d.getDate() === 1) {
			return format(d, "d MMM");
		}

		return format(d, "d");
	};

	return (
		<div className="h-18rem w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={timeseries as unknown as RequestData[]}
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
						allowDecimals={false}
						className="font-mono"
					/>
					<Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
					<Line
						type="monotone"
						dataKey="count_2xx"
						name="2XX"
						strokeWidth={2}
						stroke="rgb(59 130 246)"
						dot={false}
					/>
					<Line
						type="monotone"
						dataKey="count_3xx"
						name="3XX"
						stroke="#888"
						strokeWidth={2}
						dot={false}
					/>
					<Line
						type="monotone"
						dataKey="count_4xx"
						name="4XX"
						stroke="rgb(250 204 21)"
						strokeWidth={2}
						dot={false}
					/>
					<Line
						type="monotone"
						dataKey="count_5xx"
						name="5XX"
						stroke="rgb(239 68 68)"
						strokeWidth={2}
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
