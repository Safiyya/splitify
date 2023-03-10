import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import { Playlist } from "@/types";

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
      description: "Created by Splitify",
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
