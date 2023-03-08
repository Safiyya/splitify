import service from "@/services/spotify";
import { clusterTracksByGenre } from "@/utils";
import { AudioFeatures, SavedTracksData } from "@/types";
import { chunk } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { LIKED_TRACKS_LIMIT } from "@/constants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<number | undefined | { error: any }>
) {
  const { data } = await service.User().totalSavedTracks(req, res);

  res.status(200).json(data?.total);
}
