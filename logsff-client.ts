/**
 * Logsff is a simple backend observability tool.
 *
 * This is the client for the Logsff service. Copy and paste into your project and use the `send` function to log requests and errors.
 *
 * @see https://degreat.co.uk/logsff
 */

type RequestLog = {
	type: "request";
	appId: string;
	method: string;
	path: string;
	sessionId?: string;
	meta?: Record<string, any>;
	status: number;
	timestamp: number;
	duration: number;
};

type AppLog = {
	type: "app";
	appId: string;
	level: "info" | "error" | "warn";
	message: string;
	timestamp: number;
	duration?: number;
	sessionId?: string;
	meta?: Record<string, any>;
};

type Log = RequestLog | AppLog;

async function send(log: Exclude<Log, "appId">) {
	if (
		!process.env.LOGSFF_URL ||
		!process.env.LOGSFF_TOKEN ||
		!process.env.LOGSFF_APP_ID
	) {
		console.warn("Logsff is not configured");
		return;
	}

	const res = await fetch(process.env.LOGSFF_URL, {
		method: "POST",
		body: JSON.stringify({ ...log, appId: process.env.LOGSFF_APP_ID }),
		headers: {
			"Content-Type": "application/json",
			Authorization: process.env.LOGSFF_TOKEN!,
		},
	});

	if (!res.ok) {
		throw new LogsffError(await res.text(), res);
	}

	return await res.json();
}

class LogsffError extends Error {
	response: any;
	constructor(message: string, response: any) {
		super(message);
		this.response = response;
	}
}

export { send };
