import { AudioFeatures, Track } from "@/types";
import { NextApiRequest } from "next";
import request from "./request";

export const getAudioFeatures = async (
  req: NextApiRequest,
  tracksIds: string[]
) => {
  const response = await request<{ audio_features: Array<AudioFeatures> }>(
    req,
    `/audio-features?ids=${tracksIds.join(",")}`
  );

  return response;
};
