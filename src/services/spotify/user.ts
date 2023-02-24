import { Track } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import request from "./request";

const INCREMENT = 50;

export const getSavedTracks = async (
  req: NextApiRequest,
  res: NextApiResponse,
  limit: number
) => {
  const items: { track: Track }[] = [];

  let offset = 0;

  while (offset <= limit) {
    const response = await request<{ items: Array<{ track: Track }> }>(
      req,
      res,
      `/me/tracks?limit=50&offset=${offset}`
    );

    if (response.status === 200) {
      items.push(...response.data.items);
    } else {
      return {
        status: response.status,
        error: "Cannot retrieve saved tracks with offset " + offset.toString(),
      };
      break;
    }

    offset += INCREMENT;
  }

  return {
    status: 200,
    data: {
      items,
    },
  };
};
