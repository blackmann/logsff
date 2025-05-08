import { lastAppCookie } from "./cookies.server";

export async function getLastAppRedirect(request: Request) {
	const { app } =
		(await lastAppCookie.parse(request.headers.get("Cookie"))) || {};

	const redirectTo = app && `/app/${app}/requests`;

	return { redirectTo, lastApp: app };
}
