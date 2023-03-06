import { Cluster } from "@/types";
import { AddIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { Flex, Text, Button, FlexProps } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useGetPlaylistName } from "./hooks";
import PlaylistTracks from "./PlaylistTracks";

interface PlaylistProps extends FlexProps {
  cluster: Cluster;
}

const Playlist: React.FunctionComponent<PlaylistProps> = ({
  cluster,
  ...props
}) => {
  const [isShowTracks, setIsShowTracks] = useState<boolean>();
  const playlistName = useGetPlaylistName(cluster);

  const onShowTracks = () => {
    setIsShowTracks(!isShowTracks);
  };

  const onCreatePlaylist = useCallback(async () => {
    await fetch("/api/playlists/create", {
      method: "POST",
      body: JSON.stringify({
        name: playlistName,
        tracksURIs: cluster.tracks.map((t) => t.uri).join(","),
      }),
    });
  }, [playlistName, cluster]);

  return (
    <Flex alignItems="flex-start" {...props}>
      <Button
        onClick={onShowTracks}
        mr={2}
        height="3rem"
        minWidth="3rem"
        width="3rem"
      >
        <ArrowForwardIcon />
      </Button>
      <Flex flexDirection="column" mb={2}>
        <Text
          noOfLines={1}
          textOverflow="ellipsis"
          fontWeight="bold"
          textAlign="left"
          mr={1}
        >
          {playlistName}
        </Text>
        <Text fontSize="0.75rem">
          Playlist | {cluster.tracks.length} tracks
        </Text>
        {isShowTracks && <PlaylistTracks cluster={cluster} />}
      </Flex>
      <Button
        onClick={onCreatePlaylist}
        ml="auto"
        height="3rem"
        minWidth="3rem"
        width="3rem"
      >
        <AddIcon />
      </Button>
    </Flex>
  );
};

export default Playlist;
