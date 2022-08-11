import { json } from "@remix-run/server-runtime";
import { verifyLogin } from "~/models/user.server";
import { createUserSession } from "~/services/session.server";
import { validateEmail } from "~/utils/data";
import { inputFromForm } from "~/utils/input-resolvers";

export async function login(request: Request) {
  const { email, password, redirectTo, remember, userAgent } =
    await inputFromForm(request);

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string") {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    userAgent: JSON.parse(userAgent as string),
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/notes",
  });
}
