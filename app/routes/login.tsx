import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import * as React from "react";

import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  chakra,
} from "@chakra-ui/react";
import { createUserSession, getUserId } from "~/services/session.server";
import { verifyLogin } from "~/models/user.server";
import { validateEmail } from "~/utils/data";
import { ChakraRemixLink } from "~/components/factory";
import { inputFromForm } from "~/utils/input-resolvers";
import { getUserAgent } from "~/utils/client";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
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
};

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/notes";
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  const transition = useTransition();
  const isLoading = !!transition.submission;

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  const agent = getUserAgent();

  return (
    <Flex minH="full" direction="column" justify="center">
      <chakra.div mx="auto" w="full" maxW="md" px="8">
        <Form method="post" noValidate>
          <input type="hidden" name="userAgent" value={JSON.stringify(agent)} />
          <Flex direction="column" gap="6">
            <FormControl
              isInvalid={actionData?.errors?.email ? true : undefined}
            >
              <FormLabel
                htmlFor="email"
                fontSize="sm"
                fontWeight="medium"
                color="gray.700"
              >
                Email address
              </FormLabel>
              <Input
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                mt="1"
              />
              <FormErrorMessage>{actionData?.errors?.email}</FormErrorMessage>
            </FormControl>

            <FormControl
              isInvalid={actionData?.errors?.password ? true : undefined}
            >
              <FormLabel
                htmlFor="password"
                fontSize="sm"
                fontWeight="medium"
                color="gray.700"
              >
                Password
              </FormLabel>
              <Input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                mt="1"
              />
              <FormErrorMessage>
                {actionData?.errors?.password}
              </FormErrorMessage>
            </FormControl>

            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
              Log in
            </Button>
            <Flex direction="column" align="center" justify="space-between">
              <Checkbox id="remember" name="remember">
                Remember me
              </Checkbox>

              <chakra.div textAlign="center" fontSize="sm" color="gray.500">
                Don't have an account?{" "}
                <ChakraRemixLink
                  color="blue.500"
                  textDecor="underline"
                  to={{
                    pathname: "/join",
                    search: searchParams.toString(),
                  }}
                >
                  Sign up
                </ChakraRemixLink>
              </chakra.div>
            </Flex>
          </Flex>
        </Form>
      </chakra.div>
    </Flex>
  );
}
