import { json } from "@remix-run/server-runtime";
import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession } from "~/services/session.server";
import { validateEmail } from "~/utils/data";
import { inputFromForm } from "~/utils/input-resolvers";

export async function join(request: Request) {
  const { email, password, redirectTo, userAgent } = await inputFromForm(
    request
  );

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

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
          password: null,
        },
      },
      { status: 400 }
    );
  }

  const user = await createUser(email, password);

  return createUserSession({
    userAgent: JSON.parse(userAgent as string),
    request,
    userId: user.id,
    remember: false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  });
}
