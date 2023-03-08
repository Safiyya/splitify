import {
  ArrowForwardIcon,
  DeleteIcon,
  EditIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
import {
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";

import { Track } from "@/types";

interface PlaylistTrackProps {
  track: Track;
}

const PlaylistTrack: React.FunctionComponent<PlaylistTrackProps> = ({
  track,
}) => {
  const onPlayTrack = () => {};

  return (
    <Flex key={track.id} alignItems="flex-start">
      <Button
        onClick={onPlayTrack}
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
          {track.name}
        </Text>
        <Text fontSize="0.75rem">
          {track.artists.map((a) => a.name).join(" & ")} | {track.album.name}
        </Text>
        <Text fontSize="0.75rem">{track.genres.join(" | ")}</Text>
      </Flex>
      <Menu>
        <MenuButton
          ml="auto"
          as={IconButton}
          aria-label="Options"
          icon={<HamburgerIcon />}
          variant="outline"
        />
        <MenuList>
          <MenuItem icon={<DeleteIcon />}>Remove</MenuItem>
          <MenuItem icon={<EditIcon />} command="⌘O">
            Move to ...
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default PlaylistTrack;
