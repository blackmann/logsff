import {
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
} from "@remix-run/node";
import { checkAuth } from "~/lib/check-auth";
import { getLastAppRedirect } from "~/lib/get-last-app";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	try {
		await checkAuth(request);
	} catch (error) {
		return redirect("/login");
	}

	const { redirectTo } = await getLastAppRedirect(request);

	return redirect(redirectTo);
};

export const meta: MetaFunction = () => {
	return [
		{ title: "logsff" },
		{ name: "description", content: "Tailing server logs" },
	];
};

export default function Index() {
	return <div>Hi</div>;
}
