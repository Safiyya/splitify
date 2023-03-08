import { AudioFeatures } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import request from "./request";

export const getAudioFeatures = async (
  req: NextApiRequest,
  res: NextApiResponse,
  tracksIds: string[]
) => {
  const response = await request<{ audio_features: Array<AudioFeatures> }>(
    req,
    res,
    `/audio-features?ids=${tracksIds.join(",")}`
  );

  return response;
};
