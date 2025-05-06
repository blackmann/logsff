import { createCookie } from "@remix-run/node";

export const MAX_COOKIE_AGE = 60 * 60 * 24 * 14 * 1000; // 14 days

// About cookies: https://remix.run/docs/en/main/utils/cookies

export const userPrefs = createCookie("user-prefs", {
	maxAge: MAX_COOKIE_AGE,
});

export const authCookie = createCookie("auth", {
	secrets: process.env.COOKIE_SECRET?.split(",") ?? [],
	maxAge: MAX_COOKIE_AGE,
	secure: true,
});

export const lastAppCookie = createCookie("last-app", {
	maxAge: MAX_COOKIE_AGE,
	secure: true,
	httpOnly: true,
});
