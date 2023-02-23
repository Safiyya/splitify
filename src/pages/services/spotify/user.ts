import { Track } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import request from "./request";

export const getSavedTracks = async (
  req: NextApiRequest,
  res: NextApiResponse,
  limit: number
) => {
  const response = await request<{ items: Array<{ track: Track }> }>(
    req,
    res,
    `/me/tracks?limit=${limit}&offset=50`
  );

  return response;
};
