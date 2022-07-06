import bcrypt from "bcryptjs";

import type { DBKey } from "~/db";
import { client, e } from "~/db";

export async function getUserById(id: DBKey<typeof e.User.id>) {
  const query = e.select(e.User, (user) => ({
    ...e.User["*"],
    filter: e.op(user.id, "=", e.uuid(id)),
  }));

  const user = await query.run(client);
  return user;
}

export async function getUserByEmail(email: DBKey<typeof e.User.email>) {
  const query = e.select(e.User, (user) => ({
    ...e.User["*"],
    filter: e.op(user.email, "=", email),
  }));

  return await query.run(client);
}

export async function createUser(
  email: DBKey<typeof e.User.id>,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const userMutation = e.insert(e.User, {
    email,
  });

  const passwordMutation = e.insert(e.Password, {
    hash: hashedPassword,
    user: userMutation,
  });

  const createdUser = await e
    .select(passwordMutation, () => ({
      id: true,
      user: { ...e.User["*"] },
    }))
    .run(client);

  return createdUser.user;
}

export async function deleteUserByEmail(email: DBKey<typeof e.User.id>) {
  const deleteMutation = e.delete(e.User, (user) => ({
    filter: e.op(user.email, "=", email),
  }));

  return await deleteMutation.run(client);
}

export async function verifyLogin(
  email: DBKey<typeof e.User.id>,
  password: DBKey<typeof e.Password.hash>
) {
  const query = e.select(e.User, (user) => ({
    ...e.User["*"],
    password: {
      hash: true,
    },
    filter: e.op(user.email, "=", email),
  }));

  const userWithPassword = await query.run(client);

  console.log("userWithPassword", userWithPassword);

  if (!userWithPassword?.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
