import type { DBKey } from "~/db";
import { client, e } from "~/db";
import { getUserById } from "~/models/user.server";
import { getLastActiveSession, getSession } from "~/services/session.server";

export async function getMembershipById(id: DBKey<typeof e.Membership.id>) {
  return await e
    .select(e.Membership, (membership) => ({
      ...e.Membership["*"],
      organization: {
        ...e.Organization["*"],
      },
      filter: e.op(membership.id, "=", e.uuid(id)),
    }))
    .run(client);
}

export async function getActiveMembershipId(userId?: string) {
  if (!userId) return;
  const lastSession = await getLastActiveSession({ userId });
  const lastActiveMembership = lastSession?.membership.id;
  if (lastActiveMembership) return lastActiveMembership;

  const user = await getUserById(userId);
  const firstMembershipId = user?.memberships[0].id;
  return firstMembershipId;
}

export async function getActiveMembership(userId?: string) {
  const membershipId = await getActiveMembershipId(userId);
  if (membershipId) return await getMembershipById(membershipId);
}

export async function switchMembership(
  request: Request,
  membershipId?: string
) {
  if (!membershipId) return;
  const activeSession = await getSession(request);

  activeSession.set("membershipId", membershipId);
  return await sessionStorage.commitSession(activeSession);
}
