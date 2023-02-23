import { Track } from "@/types";
import { NextApiRequest } from "next";
import request from "./request";

export const getSavedTracks = async (req: NextApiRequest, limit: number) => {
  const response = request<{ items: Array<{ track: Track }> }>(
    req,
    `/me/tracks?limit=${limit}&offset=50`
  );

  return response;
};
