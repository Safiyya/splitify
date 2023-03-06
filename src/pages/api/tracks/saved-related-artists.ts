// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Artist, SavedTrack, SavedTracksData } from "@/types";
import {
  chunk,
  compact,
  intersection,
  intersectionBy,
  shuffle,
  uniq,
  uniqBy,
} from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { ACCESS_TOKEN_KEY } from "../../../constants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SavedTracksData>
) {
  const accessToken = req.cookies[ACCESS_TOKEN_KEY];

  const responseSavedTracks = await fetch(
    "https://api.spotify.com/v1/me/tracks?limit=50&offset=50",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const savedTracks: SavedTracksData = await responseSavedTracks.json();

  const artistsIds = savedTracks.items
    .map((item) => item.track.artists)
    .flat()
    .map((a) => a.id);

  const N = 5;

  const artistsIdsChunks = chunk(artistsIds, 20);

  let i = 0;
  let artists: Artist[] = [];
  let relatedArtists: Map<string, Artist[]> = new Map();
  while (i < artistsIdsChunks.length) {
    const responseArtists = await fetch(
      `https://api.spotify.com/v1/artists?ids=${artistsIdsChunks[i].join(",")}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    await Promise.all(
      artistsIdsChunks[i].map(async (artistId) => {
        const response = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();
        relatedArtists.set(artistId, data.artists);
      })
    );

    const artistsData: {
      artists: Artist[];
    } = await responseArtists.json();
    artists = [...artists, ...artistsData.artists];
    i++;
  }

  const artistsWithRelated = artists.map((artist) => ({
    ...artist,
    genres: artists.find((a) => a.id === artist.id)?.genres,
    related: relatedArtists.get(artist.id),
  }));

  function clusterArtists(artists: Artist[]) {
    const clusters: Array<Artist[]> = [];

    for (const artist of artists) {
      // Check if the artist is already in a cluster
      let found = false;
      for (const cluster of clusters) {
        if (cluster.find((a) => a.id === artist.id)) {
          found = true;
          break;
        }
      }

      // If the artist is not in a cluster, create a new cluster
      if (!found) {
        const cluster = [artist];
        const relatedArtists = artist.related;

        // Add any artists that have common related artists to the cluster
        for (const otherArtist of artists) {
          if (otherArtist !== artist) {
            const otherRelatedArtists = otherArtist.related;
            const commonArtists = intersectionBy(
              relatedArtists || [],
              otherRelatedArtists || [],
              (x) => x.id
            );

            if ((commonArtists?.length || 0) > 0) {
              cluster.push(otherArtist, ...commonArtists);
            }
          }
        }

        clusters.push(cluster);
      }
    }

    return clusters;
  }

  const clusters = clusterArtists(shuffle(artistsWithRelated));

  const data = {
    ...savedTracks,
    items: savedTracks.items.map((item) => ({
      track: {
        ...item.track,
        artists: item.track.artists.map((artist) => ({
          ...artist,
          genres: artists.find((a) => a.id === artist.id)?.genres,
          related: relatedArtists.get(artist.id),
        })),
      },
    })),
  };

  res.status(200).json(data);
}
