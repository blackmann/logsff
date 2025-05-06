import type { Opts } from "./get-requests-timeseries";
import { prisma } from "./prisma.server";

export async function getAppTimeseries({
	slug,
	startDate,
	endDate,
	period = "45d",
}: Opts) {
	// If we're in 48h mode, we need to group by hour instead of day
	if (period === "48h") {
		const result = await prisma.$queryRaw`
    WITH RECURSIVE hours AS (
      SELECT DATE_TRUNC('hour', ${startDate}::timestamp) as hour
      UNION ALL
      SELECT hour + INTERVAL '1 hour'
      FROM hours
      WHERE hour < DATE_TRUNC('hour', ${endDate}::timestamp)
    )
    SELECT
      hours.hour as date,
      COALESCE(COUNT(CASE WHEN "AppLog".level = 'error' THEN "AppLog".id END), 0) AS count_error,
      COALESCE(COUNT(CASE WHEN "AppLog".level = 'warn' THEN "AppLog".id END), 0) AS count_warn,
      COALESCE(COUNT(CASE WHEN "AppLog".level = 'info' THEN "AppLog".id END), 0) AS count_info
    FROM hours
    LEFT JOIN "AppLog" ON
      DATE_TRUNC('hour', "AppLog".timestamp) = hours.hour
      AND "AppLog"."appId" = ${slug}
    GROUP BY hours.hour
    ORDER BY hours.hour
  `;

		const typedResult = result as {
			date: string;
			count_error: number;
			count_warn: number;
			count_info: number;
		}[];

		return typedResult;
	}

	// Default 45d view: group by day
	const result = await prisma.$queryRaw`
    WITH RECURSIVE dates AS (
      SELECT DATE_TRUNC('day', ${startDate}::timestamp) as day
      UNION ALL
      SELECT day + INTERVAL '1 day'
      FROM dates
      WHERE day < DATE_TRUNC('day', ${endDate}::timestamp)
    )
    SELECT
      dates.day as date,
      COALESCE(COUNT(CASE WHEN "AppLog".level = 'error' THEN "AppLog".id END), 0) AS count_error,
      COALESCE(COUNT(CASE WHEN "AppLog".level = 'warn' THEN "AppLog".id END), 0) AS count_warn,
      COALESCE(COUNT(CASE WHEN "AppLog".level = 'info' THEN "AppLog".id END), 0) AS count_info
    FROM dates
    LEFT JOIN "AppLog" ON
      DATE_TRUNC('day', "AppLog".timestamp) = dates.day
      AND "AppLog"."appId" = ${slug}
    GROUP BY dates.day
    ORDER BY dates.day
  `;

	const typedResult = result as {
		date: string;
		count_error: number;
		count_warn: number;
		count_info: number;
	}[];

	return typedResult;
}
