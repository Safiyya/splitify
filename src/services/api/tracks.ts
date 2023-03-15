import { Session } from "next-auth";
import { useQuery } from "react-query";

import { RawTrack } from "@/types";

const PAGE_LIMIT = 50;

export const fetchTracks = async (session: Session, offset: number) => {
  const response = await fetch(
    `https://api.spotify.com/v1/me/tracks?limit=${PAGE_LIMIT}&offset=${offset}`,
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
      offset: (data.offset + PAGE_LIMIT) as number,
      items: data.items.map((i: any) => i.track) as RawTrack[],
      next: data.next as string,
    };
  } else {
    throw Error("Cannot retrieve tracks");
  }
};

export const useGetTotalTracks = () => {
  return useQuery<number, Error>(
    "totalTracks",
    () => fetch("/api/tracks/total").then((res) => res.json()),
    {
      enabled: true,
    }
  );
  // return { isLoading: false, error: null, data: 500 };
};
