import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

import {
  Button,
  Flex,
  Heading,
  ListItem,
  UnorderedList,
  chakra,
} from "@chakra-ui/react";
import {
  getUserSessions,
  logoutOtherSessions,
  logoutSession,
  requireUserId,
} from "~/services/session.server";
import { useUser } from "~/utils/data";
import { inputFromForm } from "~/utils/input-resolvers";

type LoaderData = {
  sessions: Awaited<ReturnType<typeof getUserSessions>>;
};

export const action: ActionFunction = async ({ request }) => {
  const { sessionId } = await inputFromForm(request);
  if (sessionId) {
    return await logoutSession(sessionId as string);
  }
  return logoutOtherSessions(request);
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const sessions = await getUserSessions({ userId, request });
  return json<LoaderData>({ sessions });
};

export default function NotesPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <Flex h="full" minH="screenY" direction="column">
      <Flex
        as="header"
        align="center"
        justify="space-between"
        bg="slategrey"
        color="white"
        p="2"
      >
        <Heading fontSize="3xl">
          <Link to=".">Notes</Link>
        </Heading>
        <p>{user.email}</p>
        <Flex gap="2" align="center">
          <Button as={Link} to="/sessions" colorScheme="green" size="sm">
            Sessions
          </Button>
          <Form action="/logout" method="post">
            <Button type="submit" colorScheme="red" size="sm">
              Logout
            </Button>
          </Form>
        </Flex>
      </Flex>

      <Flex as="main" h="full" bg="white">
        <chakra.div flex="1" p="6">
          <UnorderedList spacing="4">
            {data.sessions?.map((session) => {
              const data = JSON.parse(session.data);
              return (
                <ListItem key={session.id}>
                  <div>
                    <b>IP:</b> {data.ip_address}
                    {session.is_current_device && (
                      <>
                        - <b> Current session</b>
                      </>
                    )}
                  </div>
                  <div>
                    <b>Browser:</b> {data.browser.name} - v
                    {data.browser.version}{" "}
                  </div>
                  <div>
                    <b>Device: </b>
                    {data.platform.vendor}, {data.platform.type} -{" "}
                    {data.os.name}{" "}
                    {data.os.versionName || `v` + data.os.version}
                  </div>
                  <Flex gap="2">
                    {session.is_current_device ? (
                      <Form method="post">
                        <Button type="submit" colorScheme="red" size="xs">
                          Logout other sessions
                        </Button>
                      </Form>
                    ) : (
                      <Form method="post">
                        <input
                          type="hidden"
                          name="sessionId"
                          value={session.id}
                        />
                        <Button type="submit" colorScheme="orange" size="xs">
                          Logout
                        </Button>
                      </Form>
                    )}
                  </Flex>
                </ListItem>
              );
            })}
          </UnorderedList>
        </chakra.div>
      </Flex>
    </Flex>
  );
}
