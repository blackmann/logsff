const formatHour = (
	index: number,
	worktime: { timestamp: string; count: number }[],
) => {
	const timestamp = new Date(worktime[index].timestamp);
	const hour = timestamp.getHours();

	const timeRange = `${hour.toString().padStart(2, "0")}:00 - ${(hour === 23 ? 0 : hour + 1).toString().padStart(2, "0")}:00`;

	const now = new Date();
	const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const timestampDateOnly = new Date(
		timestamp.getFullYear(),
		timestamp.getMonth(),
		timestamp.getDate(),
	);

	const diffDays = Math.floor(
		(todayDate.getTime() - timestampDateOnly.getTime()) / (24 * 60 * 60 * 1000),
	);

	let dayLabel: string;
	if (diffDays === 0) {
		dayLabel = "Today";
	} else if (diffDays === 1) {
		dayLabel = "Yesterday";
	} else {
		dayLabel = timestamp.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	}

	return `${dayLabel}, ${timeRange}`;
};

export { formatHour };
