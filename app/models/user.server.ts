import bcrypt from "bcryptjs";

import type { DBKey } from "~/db";
import { client, e } from "~/db";

export async function getUserById(id: DBKey<typeof e.User.id>) {
  const query = e.select(e.User, (user) => ({
    ...e.User["*"],
    password: {
      ...e.Password["*"],
    },
    filter: e.op(user.id, "=", e.uuid(id)),
  }));

  const user = await query.run(client);
  return user;
}

export async function getUserByEmail(email: DBKey<typeof e.User.email>) {
  const query = e.select(e.User, (user) => ({
    ...e.User["*"],
    password: {
      ...e.Password["*"],
    },
    filter: e.op(user.email, "=", email),
  }));

  return await query.run(client);
}

export async function createUser(
  email: DBKey<typeof e.User.id>,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = e.insert(e.User, {
    email,
    password: e.insert(e.Password, {
      hash: hashedPassword,
    }),
  });

  const res = await query.run(client);

  return res;
}

export async function deleteUserByEmail(email: DBKey<typeof e.User.id>) {
  const query = e.delete(e.User, (user) => ({
    ...e.User["*"],
    password: {
      ...e.Password["*"],
    },
    filter: e.op(user.email, "=", email),
  }));

  return await query.run(client);
}

export async function verifyLogin(
  email: DBKey<typeof e.User.id>,
  password: DBKey<typeof e.Password.hash>
) {
  const userWithPassword = await getUserByEmail(email);

  if (!userWithPassword || !userWithPassword.password) {
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
