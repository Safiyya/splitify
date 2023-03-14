import { Session } from "next-auth";

import { Artist } from "@/types";

export const fetchArtists = async (session: Session, artistsIds: string[]) => {
  const response = await fetch(
    `https://api.spotify.com/v1/artists?ids=${artistsIds?.join(",")}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    }
  );

  if (response.status === 200) {
    const data = await response.json();
    return {
      artists: data.artists as Artist[],
    };
  } else {
    return {
      artists: [],
    };
  }
};
