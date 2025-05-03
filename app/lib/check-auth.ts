import type { User } from "@prisma/client";
import { authCookie } from "./cookies.server";
import { prisma } from "./prisma.server";
import { unauthorized } from "./responses";

async function checkAuth(request: Request): Promise<User> {
	const { userId } =
		(await authCookie.parse(request.headers.get("Cookie"))) || {};

	if (!userId) throw unauthorized();

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) throw new Error("User not found");

		return user;
	} catch (err) {
		console.error(err);
		throw unauthorized();
	}
}

export { checkAuth };
