import { Playlist } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import request from "./request";

export const createPlaylist = async (
  req: NextApiRequest,
  res: NextApiResponse,
  name: string,
  tracksURIs: string
) => {
  const session = await getSession({ req });

  const response = await request<Playlist>(
    req,
    res,
    `/users/${session?.user.id}/playlists`,
    "POST",
    JSON.stringify({
      name: `SPLITIFY - ${name}`,
      public: false,
    })
  );

  const { id } = response.data ?? { id: null };

  if (!id) {
    return {
      status: 500,
      error: "Cannot create playlist",
    };
  }

  console.log({ tracksURIs });
  const { data } = await request<Playlist>(
    req,
    res,
    `/playlists/${id}/tracks?uris=${tracksURIs}`,
    "POST"
  );

  return {
    status: 200,
    data,
  };
};
