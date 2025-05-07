import { endOfDay, startOfDay, addDays, addHours } from "date-fns";
import { prisma } from "./prisma.server";

export interface Opts {
	slug: string;
	startDate: Date;
	endDate: Date;
	period?: "45d" | "48h";
}

export async function getRequestsTimeseries({
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
        COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 200 AND 299 THEN "RequestLog".id END), 0) AS count_2xx,
        COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 300 AND 399 THEN "RequestLog".id END), 0) AS count_3xx,
        COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 400 AND 499 THEN "RequestLog".id END), 0) AS count_4xx,
        COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 500 AND 599 THEN "RequestLog".id END), 0) AS count_5xx
      FROM hours
      LEFT JOIN "RequestLog" ON
        DATE_TRUNC('hour', "RequestLog".timestamp) = hours.hour
      AND "RequestLog"."appId" = ${slug}
      GROUP BY hours.hour
      ORDER BY hours.hour
    `;

		const typedResult = result as {
			date: string;
			count_2xx: number;
			count_3xx: number;
			count_4xx: number;
			count_5xx: number;
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
      COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 200 AND 299 THEN "RequestLog".id END), 0) AS count_2xx,
      COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 300 AND 399 THEN "RequestLog".id END), 0) AS count_3xx,
      COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 400 AND 499 THEN "RequestLog".id END), 0) AS count_4xx,
      COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 500 AND 599 THEN "RequestLog".id END), 0) AS count_5xx
    FROM dates
    LEFT JOIN "RequestLog" ON
      DATE_TRUNC('day', "RequestLog".timestamp) = dates.day
    AND "RequestLog"."appId" = ${slug}
    GROUP BY dates.day
    ORDER BY dates.day
  `;

	const typedResult = result as {
		date: string;
		count_2xx: number;
		count_3xx: number;
		count_4xx: number;
		count_5xx: number;
	}[];

	return typedResult;
}

interface OptsOpts {
	startDate?: Date;
	period: "45d" | "48h";
}

export function getQueryOpts({ startDate, period }: OptsOpts) {
	if (period === "45d") {
		const baseStartDate =
			startDate ?? new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
		return {
			startDate: startOfDay(baseStartDate),
			endDate: endOfDay(addDays(baseStartDate, 45)),
			period: "45d" as const,
		};
	}

	const baseStartDate = startDate ?? new Date(Date.now() - 48 * 60 * 60 * 1000);
	return {
		startDate: startOfDay(baseStartDate),
		endDate: addHours(baseStartDate, 48),
		period: "48h" as const,
	};
}
