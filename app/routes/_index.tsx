import {
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
} from "@remix-run/node";
import { checkAuth } from "~/lib/check-auth";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	try {
		await checkAuth(request);
	} catch (error) {
		return redirect("/login");
	}

	return redirect("/app");
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
