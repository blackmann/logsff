import { lastAppCookie } from "./cookies.server";

export async function getLastAppRedirect(request: Request) {
	const cookieHeader = request.headers.get("Cookie");
	const lastApp = await lastAppCookie.parse(cookieHeader);

	const redirectTo = lastApp?.app ? `/app/${lastApp.app}/requests` : "/app/";

	return { redirectTo, lastApp };
}
