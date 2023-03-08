import React from "react";
import { useSession, signIn } from "next-auth/react";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import Layout from "@/components/Layout";
import LoadTracks from "@/components/LoadTracks";

export default function Login() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <Layout>
          <LoadTracks />
        </Layout>
      </>
    );
  }

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      py={2}
      height="100%"
      width="100%"
    >
      <Heading size="4xl">Splitify</Heading>
      <Text textAlign="center">Split your Spotify saved tracks per genre </Text>
      <Button
        colorScheme="teal"
        variant="solid"
        my={4}
        onClick={() => signIn()}
      >
        Start here
      </Button>
    </Flex>
  );
}
