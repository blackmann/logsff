import type { Opts } from "./get-requests-timeseries";
import { prisma } from "./prisma.server";

export async function getAppSummary(opts: Opts) {
	const [summary] = (await prisma.$queryRaw`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN level = 'error' THEN 1 END) as errors
    FROM "AppLog"
    WHERE "appId" = ${opts.slug}
    AND timestamp BETWEEN ${opts.startDate}::timestamp AND ${opts.endDate}::timestamp
  `) as { total: number; errors: number }[];

	return summary;
}
