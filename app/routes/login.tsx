import type { ActionFunctionArgs } from "@remix-run/node";
import { useForm } from "react-hook-form";
import { Input } from "~/components/input";

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const email = formData.get("email");
	const password = formData.get("password");
}

export default function Login() {
	const { register, handleSubmit } = useForm();

	return (
		<div>
			<form>
				<Input {...register("email", { required: true })} />
				<Input type="password" {...register("password", { required: true })} />
			</form>
		</div>
	);
}
