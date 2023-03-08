import { chunk, compact, intersectionBy, uniq } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";

import { Artist, Track } from "@/types";

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

export const getSavedTracks = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const PAGE_LIMIT = 50;
  const items: { track: Track }[] = [];

  let pageLength = PAGE_LIMIT;
  let offset = 0;

  while (pageLength > 0) {
    const response = await request<{ items: Array<{ track: Track }> }>(
      req,
      res,
      `/me/tracks?limit=${PAGE_LIMIT}&offset=${offset}`
    );

    if (response.status === 200) {
      items.push(...response.data.items);
      pageLength = response.data.items.length;
    } else {
      return {
        status: response.status,
        error: "Cannot retrieve saved tracks from offset " + offset,
      };
      break;
    }

    offset += INCREMENT;
  }

  // Also retrieve all artist with their genres and add to tracks
  const artistsIds = uniq(
    items
      .map((i) => i.track.artists)
      .flat()
      .map((a) => a.id)
  );
  const artistsIdsChunks = chunk(artistsIds, 50);
  const artists: Artist[] = [];

  const results = await Promise.allSettled(
    artistsIdsChunks.map(async (chunk) => {
      const response = await request<{ artists: Array<Artist> }>(
        req,
        res,
        `/artists?ids=${chunk.join(",")}`
      );

      if (response.status === 200) {
        const data = response.data.artists;
        artists.push(...data);
      }
    })
  );

  if (results.find((r) => r.status === "rejected")) {
    return {
      status: 500,
      error: "Cannot retrieve artists of saved tracks ",
    };
  }

  // Add artists data to all tracks
  return {
    status: 200,
    data: {
      items: items.map((i) => ({
        track: {
          ...i.track,
          genres: compact(
            intersectionBy(artists, i.track.artists, (a) => a?.id)
              .map((a) => a.genres)
              .flat()
          ),
        },
      })),
    },
  };
};
