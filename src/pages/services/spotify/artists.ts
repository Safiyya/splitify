import { Track } from "@/types";
import { NextApiRequest } from "next";
import request from "./request";

export const getTopTracks = async (req: NextApiRequest, artistId: string) => {
  console.log("getTopTracks", artistId);
  const response = await request<{ tracks: Array<Track> }>(
    req,
    `/artists/${artistId}/top-tracks?market=GB`
  );

  console.log(response.status);

  return response;
};
