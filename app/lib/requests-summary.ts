interface RequestSummary {
	total: number;
	errors: number;
	lastHourTotal: number;
	previousTotal: number;
	periodDuration: number;
	formattedPeriod?: string;
}

interface RequestMetrics {
	errorRate: number;
	formattedPeriod: string;
	percentageChange: number;
	avgRequestsPerMinute: number;
}
function calculateRequestMetrics(summary: RequestSummary): RequestMetrics {
	const errorRate = (summary.errors / summary.total || 0) * 100;

	const hours = summary.periodDuration / (1000 * 60 * 60);
	const formattedPeriod =
		hours <= 48 ? `${Math.floor(hours)}h` : `${Math.floor(hours / 24)}d`;

	const percentageChange =
		summary.previousTotal > 0
			? ((summary.total - summary.previousTotal) / summary.previousTotal) * 100
			: 0;

	const avgRequestsPerMinute = summary.lastHourTotal / 60;

	return {
		errorRate,
		formattedPeriod,
		percentageChange,
		avgRequestsPerMinute,
	};
}

export { calculateRequestMetrics };
