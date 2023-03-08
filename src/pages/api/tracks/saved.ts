import type { NextApiRequest, NextApiResponse } from "next";

import service from "@/services/spotify";
import { SavedTracksData } from "@/types";
import { clusterTracksByGenre } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SavedTracksData | { error: any }>
) {
  const savedTracks = await service.User().savedTracks(req, res);

  if (savedTracks.status !== 200 || !savedTracks.data) {
    res.status(500).json({ error: savedTracks.error });
    return;
  }

  const tracks = savedTracks.data.items.map((t) => t.track);

  const clusters = clusterTracksByGenre(tracks);

  const data = {
    clusters,
    error: null,
  };

  res.status(200).json(data);
}
