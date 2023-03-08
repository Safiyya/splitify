import service from "@/services/spotify";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<number | undefined | { error: any }>
) {
  const { data } = await service.User().totalSavedTracks(req, res);

  res.status(200).json(data?.total);
}
