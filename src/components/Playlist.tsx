import { Cluster } from "@/types";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Flex, Text, Button, FlexProps } from "@chakra-ui/react";
import { useState } from "react";
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
    </Flex>
  );
};

export default Playlist;
