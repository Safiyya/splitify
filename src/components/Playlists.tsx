import { Cluster } from "@/types";
import { Flex, Text, Heading } from "@chakra-ui/react";
import Playlist from "./Playlist";

interface PlaylistsProps {
  clusters: Cluster[];
}

const Playlists: React.FunctionComponent<PlaylistsProps> = ({ clusters }) => {
  return (
    <>
      <Heading>Playlists</Heading>
      <Text fontSize="0.75rem">
        This is a preview of playlists from Splitify. You can move songs from
        one playlist to an other. When you’re done, create a new playlist,
      </Text>
      <Flex flexDirection="column" mt={4}>
        {clusters.map((c) => (
          <Playlist my={1} key={c.name} cluster={c} />
        ))}
      </Flex>
    </>
  );
};

export default Playlists;
