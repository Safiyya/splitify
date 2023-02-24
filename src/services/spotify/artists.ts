import { Track } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import request from "./request";

export const getTopTracks = async (
  req: NextApiRequest,
  res: NextApiResponse,
  artistId: string
) => {
  const response = await request<{ tracks: Array<Track> }>(
    req,
    res,
    `/artists/${artistId}/top-tracks?market=GB`
  );

  return response;
};
