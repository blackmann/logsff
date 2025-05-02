import { endOfDay, startOfDay } from "date-fns";
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
}: Opts) {
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
      COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 200 AND 299 THEN "RequestLog".id END), 0) AS count_2XX,
      COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 300 AND 399 THEN "RequestLog".id END), 0) AS count_3XX,
      COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 400 AND 499 THEN "RequestLog".id END), 0) AS count_4XX,
      COALESCE(COUNT(CASE WHEN "RequestLog".status BETWEEN 500 AND 599 THEN "RequestLog".id END), 0) AS count_5XX
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
		return {
			startDate: startOfDay(
				new Date(startDate?.getTime() ?? Date.now() - 45 * 24 * 60 * 60 * 1000),
			),
			endDate: endOfDay(startDate ?? new Date()),
			period: "45d" as const,
		};
	}

	return {
		startDate: startOfDay(
			new Date(startDate?.getTime() ?? Date.now() - 48 * 60 * 60 * 1000),
		),
		endDate: endOfDay(startDate ?? new Date()),
		period: "48h" as const,
	};
}
