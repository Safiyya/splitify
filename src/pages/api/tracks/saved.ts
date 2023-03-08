import service from "@/services/spotify";
import { clusterTracksByGenre } from "@/utils";
import { AudioFeatures, SavedTracksData } from "@/types";
import { chunk } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { LIKED_TRACKS_LIMIT } from "@/constants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SavedTracksData | { error: any }>
) {
  const savedTracks = await service
    .User()
    .savedTracks(req, res, LIKED_TRACKS_LIMIT);

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
