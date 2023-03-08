import { HamburgerIcon, StarIcon } from "@chakra-ui/icons";
import {
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FunctionComponent<LayoutProps> = ({ children }) => {
  const { data: session } = useSession();

  if (!session) {
    return <></>;
  }

  return (
    <Flex flexDirection="column" width="100%" height="100%">
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        width="100%"
        flex="1"
        my={2}
      >
        <Flex alignItems="center">
          <StarIcon mr={1} />
          <Link href="/">
            <Heading size="lg">Splitify</Heading>
          </Link>
        </Flex>
        <Flex mr="0">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="outline"
            />
            <MenuList>
              <MenuItem>{session.user.email}</MenuItem>
              <MenuItem onClick={() => signOut()}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
      <Flex flex="1"></Flex>
      {children}
    </Flex>
  );
};

export default Layout;
