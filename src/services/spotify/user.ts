import { NextApiRequest, NextApiResponse } from "next";

import request from "./request";

const INCREMENT = 50;

export const getTotalSavedTracks = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const response = await request<{ total: number }>(
    req,
    res,
    `/me/tracks?limit=1`
  );

  if (response.status === 200) {
    const { total } = response.data;
    return {
      status: 200,
      data: {
        total,
      },
    };
  } else {
    return {
      status: response.status,
      error: "Cannot retrieve total saved tracks",
    };
  }
};
