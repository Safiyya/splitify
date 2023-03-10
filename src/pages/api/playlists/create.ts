import type { NextApiRequest, NextApiResponse } from "next";

import service from "@/services/spotify";
import { Playlist } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Playlist | null | { error: string }>
) {
  const body = req.body;
  const { name, tracksURIs } = JSON.parse(body);

  const { data } = await service.Playlists().create(req, res, name, tracksURIs);

  if (!data) {
    res.status(500).json({ error: "Cannot create playlist" });
    return;
  }

  res.status(200).json(data);
}
