import type { Opts } from "./get-requests-timeseries";
import { prisma } from "./prisma.server";

export async function getRequestsSummary(opts: Opts) {
	const now = new Date();
	const lastHourStart = new Date(now.getTime() - 60 * 60 * 1000);
	const periodDuration = opts.endDate.getTime() - opts.startDate.getTime();
	const previousStartDate = new Date(opts.startDate.getTime() - periodDuration);
	const previousEndDate = opts.startDate;

	const [summary] = (await prisma.$queryRaw`
    SELECT
      -- Current period
      (SELECT COUNT(*) 
       FROM "RequestLog" 
       WHERE "appId" = ${opts.slug}
       AND timestamp BETWEEN ${opts.startDate}::timestamp AND ${opts.endDate}::timestamp
      ) as total,
      (SELECT COUNT(*) 
       FROM "RequestLog" 
       WHERE "appId" = ${opts.slug}
       AND timestamp BETWEEN ${opts.startDate}::timestamp AND ${opts.endDate}::timestamp
       AND status BETWEEN 400 AND 599
      ) as errors,
      -- Last hour
      (SELECT COUNT(*) 
       FROM "RequestLog" 
       WHERE "appId" = ${opts.slug}
       AND timestamp BETWEEN ${lastHourStart}::timestamp AND ${now}::timestamp
      ) as "lastHourTotal",
      -- Previous period
      (SELECT COUNT(*) 
       FROM "RequestLog" 
       WHERE "appId" = ${opts.slug}
       AND timestamp BETWEEN ${previousStartDate}::timestamp AND ${previousEndDate}::timestamp
      ) as previousTotal
  `) as {
		total: number;
		errors: number;
		lastHourTotal: number;
		previousTotal: number;
	}[];

	return {
		...summary,
		periodDuration,
	};
}
