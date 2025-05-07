import { prisma } from "./prisma.server";

export async function getAppWorkTime(slug: string) {
	const now = new Date();
	const past23Hours = new Date(now);
	past23Hours.setHours(now.getHours() - 23);

	const result = await prisma.$queryRaw`
        WITH RECURSIVE hours AS (
            SELECT DATE_TRUNC('hour', ${past23Hours}::timestamp) as hour
            UNION ALL
            SELECT hour + INTERVAL '1 hour'
            FROM hours
            WHERE hour < DATE_TRUNC('hour', ${now}::timestamp)
        )
        SELECT
            hours.hour as timestamp,
            COALESCE(COUNT("AppLog".id), 0) AS count
        FROM hours
        LEFT JOIN "AppLog" ON
            DATE_TRUNC('hour', "AppLog".timestamp) = hours.hour
            AND "AppLog"."appId" = ${slug}
        GROUP BY hours.hour
        ORDER BY hours.hour
    `;

	return result as { timestamp: string; count: number }[];
}
