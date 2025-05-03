import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
} from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import argon2 from "argon2";
import { useForm } from "react-hook-form";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { authCookie } from "~/lib/cookies.server";
import { prisma } from "~/lib/prisma.server";
import { badRequest } from "~/lib/responses";

export async function loader({ request }: LoaderFunctionArgs) {
	const userCreated = await prisma.user.count();

	return { userCreated };
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.json();
	const username = formData.username;
	const password = formData.password;

	const userCreated = await prisma.user.count();
	if (userCreated === 0) {
		const hashedPassword = await argon2.hash(password);
		const user = await prisma.user.create({
			data: {
				username,
				password: hashedPassword,
			},
		});

		return redirect("/", {
			headers: {
				"Set-Cookie": await authCookie.serialize({ userId: user.id }),
			},
		});
	}
	const user = await prisma.user.findUnique({
		where: {
			username,
		},
	});
	if (!user) {
		throw badRequest({ detail: "User not found" });
	}
	const isPasswordValid = await argon2.verify(user.password, password);
	if (!isPasswordValid) {
		throw badRequest({ detail: "Incorrect password" });
	}

	return redirect("/", {
		headers: {
			"Set-Cookie": await authCookie.serialize({ userId: user.id }),
		},
	});
}

export const meta: MetaFunction = () => {
	return [{ title: "Login" }];
};

export default function Login() {
	const { userCreated } = useLoaderData<typeof loader>();
	const { register, handleSubmit } = useForm();
	const submit = useSubmit();

	function onSubmit(data: any) {
		submit(JSON.stringify(data), {
			method: "POST",
			encType: "application/json",
			action: "/login",
		});
	}

	return (
		<div className="flex h-screen w-screen items-center justify-center">
			<div className="w-74 rounded-lg border border-gray-200 bg-zinc-50 dark:(bg-neutral-900 border-neutral-800) shadow-lg -mt-10rem">
				<div className="p-4">
					<h1 className=" font-medium">Login</h1>
					<p className="text-sm text-gray-500 mb-2">
						{userCreated
							? "Enter your username and password to continue."
							: "This is a first time login. Set username and password."}
					</p>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
						<Input
							placeholder="username"
							className="font-mono"
							{...register("username", { required: true })}
						/>

						<Input
							type={userCreated ? "password" : "text"}
							placeholder="password"
							className="font-mono"
							{...register("password", { required: true, minLength: 8 })}
						/>

						<Button type="submit">
							<div className="i-lucide-corner-down-left" />
							Enter
						</Button>
					</form>
				</div>

				<div className="border-t dark:border-neutral-800 bg-zinc-200/40 dark:bg-neutral-800/30 px-4 py-2 flex justify-end">
					<a
						href="https://github.com/blackmann/logsff"
						className="flex items-center gap-1 bg-zinc-200 dark:bg-neutral-800 px-2 py-1 rounded-xl text-secondary font-mono text-sm font-medium"
						target="_blank"
						rel="noreferrer"
					>
						<div className="i-lucide-github" /> logsff
					</a>
				</div>
			</div>
		</div>
	);
}
