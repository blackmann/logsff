SELECT COUNT(*) as total_logs FROM "RequestLog";
SELECT "appId", COUNT(*) as count FROM "RequestLog" GROUP BY "appId";
SELECT MIN(timestamp) as earliest, MAX(timestamp) as latest FROM "RequestLog";