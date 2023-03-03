import { Inter } from "@next/font/google";
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
  Image,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/react";
import { useState } from "react";
import { SavedTracksData } from "@/types";
import { useSession } from "next-auth/react";
import AccessDenied from "@/components/access-denied";

const inter = Inter({ subsets: ["latin"] });

export default function Cluster() {
  const { data: session } = useSession();
  console.log({ session });

  const [clusters, setClusters] = useState<SavedTracksData["clusters"]>();

  const getClusters = async () => {
    const response = await fetch("/api/tracks/saved");
    const data: SavedTracksData = await response.json();
    setClusters(data.clusters);
  };

  // If no session exists, display access denied message
  if (!session) {
    return <AccessDenied />;
  }

  return (
    <>
      <Container background="transparent" centerContent maxWidth="80%">
        <Center width="100%" m={2}>
          <Flex flexDirection="column" width="100%">
            <Button onClick={getClusters}>Show clusters</Button>
            {clusters && (
              <>
                <Heading my={3}>
                  {Object.entries(clusters.meta).map(([key, value]) => (
                    <Text key={key}>
                      {key}: {value}
                    </Text>
                  ))}
                </Heading>
                {clusters.data.map(({ name, tracks, genres }, i) => (
                  <Box key={i} border={2} mb={4}>
                    <Accordion defaultIndex={[0]} allowMultiple>
                      <AccordionItem>
                        <AccordionButton flex={1}>
                          <Flex flexDirection="column" flex="1">
                            <Flex flex="1" alignItems="center">
                              <Text fontSize="16px" textAlign="left" mr={3}>
                                <b>{name}</b>
                              </Text>
                              <Flex flexWrap="wrap">
                                {Object.entries(genres)
                                  .slice(0, 5)
                                  .map(([genre, total]) => (
                                    <Text
                                      key={genre}
                                      py={2}
                                      textAlign="left"
                                      mr={1}
                                    >
                                      {genre}
                                    </Text>
                                  ))}
                              </Flex>
                            </Flex>
                            <Text fontSize="11px" flex="1" textAlign="left">
                              {tracks.length} tracks
                            </Text>
                          </Flex>
                          <AccordionIcon />
                        </AccordionButton>

                        <AccordionPanel pb={4}>
                          <Flex
                            flexDirection="row"
                            overflow="scroll"
                            width="100%"
                            flexWrap="wrap"
                          >
                            {tracks.map(({ id, name, artists, genres }) => (
                              <Card
                                size="sm"
                                key={id}
                                direction={{ base: "column", sm: "row" }}
                                overflow="hidden"
                                variant="outline"
                                mb={1}
                                width="25%"
                              >
                                <Stack>
                                  <CardBody>
                                    <Heading size="md">{name}</Heading>
                                    <Text py="1">
                                      {artists.map((a) => a.name).join(" | ")}
                                    </Text>
                                    <Text
                                      fontSize="11px"
                                      fontStyle="italic"
                                      py="1"
                                    >
                                      {genres.join(" | ")}
                                    </Text>
                                  </CardBody>
                                </Stack>
                              </Card>
                            ))}
                          </Flex>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </Box>
                ))}
              </>
            )}
          </Flex>
        </Center>
      </Container>
    </>
  );
}
