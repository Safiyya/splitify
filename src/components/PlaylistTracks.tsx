import { Flex, FlexProps, Heading, Text } from "@chakra-ui/react";

import { Cluster } from "@/types";

import { useGetPlaylistName } from "./hooks";
import PlaylistTrack from "./PlaylistTrack";

interface PlaylistTracksProps extends FlexProps {
  cluster: Cluster;
}

const PlaylistTracks: React.FunctionComponent<PlaylistTracksProps> = ({
  cluster,
}) => {
  const playlistName = useGetPlaylistName(cluster);

  return (
    <>
      <Heading>{playlistName}</Heading>
      <Text fontSize="0.75rem">Playlist | {cluster.tracks.length} tracks</Text>

      <Flex flexDirection="column" mt={4}>
        {cluster.tracks.map((track) => (
          <PlaylistTrack key={track.id} track={track} />
        ))}
      </Flex>
    </>
  );
};

export default PlaylistTracks;
