import type { Note, User } from "@prisma/client";

import type { DBKey } from "~/db";
import { client, e } from "~/db";
export type { Note } from "@prisma/client";

export function getNote({
  id,
  userId,
}: {
  id: DBKey<typeof e.Note.id>;
  userId: DBKey<typeof e.User.id>;
}) {
  return e
    .select(e.Note, (note) => ({
      ...e.Note["*"],
      filter: e.op(
        e.op(note.user.id, "=", e.uuid(userId)),
        "and",
        e.op(note.id, "=", e.uuid(id))
      ),
      limit: 1,
    }))
    .assert_single()
    .run(client);
}

export function getNoteListItems({ userId }: { userId: User["id"] }) {
  return e
    .select(e.Note, (note) => ({
      id: true,
      title: true,
      filter: e.op(note.user.id, "=", e.uuid(userId)),
      order_by: note.updated_at,
    }))
    .run(client);
}

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) {
  return e
    .insert(e.Note, {
      title,
      body,
      user: e.select(e.User, (user) => ({
        filter: e.op(user.id, "=", e.uuid(userId)),
      })),
    })
    .run(client);
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return e
    .delete(e.Note, (note) => ({
      filter: e.op(
        e.op(note.user.id, "=", e.uuid(userId)),
        "and",
        e.op(note.id, "=", e.uuid(id))
      ),
    }))
    .run(client);
}
