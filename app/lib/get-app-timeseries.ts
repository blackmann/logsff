import type { Opts } from "./get-requests-timeseries";
import { prisma } from "./prisma.server";

export async function getAppTimeseries({ slug, startDate, endDate }: Opts) {
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
