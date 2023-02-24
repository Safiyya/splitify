import service from "@/services/spotify";
import { cluster } from "@/utils";
import { AudioFeatures, SavedTracksData, Track } from "@/types";
import { chunk } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";

const LIKED_TRACKS_LIMIT = 50;
const ARTISTS_LIMIT = 5;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SavedTracksData | { error: any }>
) {
  // TODO : Remove in prod
  res.setHeader("Cache-Control", "no-store");

  const savedTracks = await service
    .User()
    .savedTracks(req, res, LIKED_TRACKS_LIMIT);

  if (savedTracks.status !== 200) {
    res.status(500).json({ error: savedTracks.error });
    return;
  }

  const artistsIds = savedTracks.data.items
    .map((item) => item.track.artists)
    .flat()
    .map((a) => a.id)
    .slice(0, ARTISTS_LIMIT);

  let topTracksByArtist: Map<string, Track[]> = new Map();
  const tracks: Track[] = [];
  let results = await Promise.allSettled(
    artistsIds.map(async (artistId) => {
      const topTracks = await service
        .Artists()
        .getTopTracks(req, res, artistId);

      tracks.push(...topTracks?.data?.tracks);
      topTracksByArtist.set(artistId, topTracks?.data?.tracks);
    })
  );

  if (results.find((r) => r.status === "rejected")) {
    res.status(500).json({ error: "Cannot retrieve top tracks" });
    return;
  }

  const tracksIds = Array.from(savedTracks.data.items)
    .flat()
    .map((track) => track.track);
  const tracksIdsChunks = chunk(tracksIds, 50);

  let featuresByTrack: Map<string, AudioFeatures> = new Map();
  results = await Promise.allSettled(
    tracksIdsChunks.map(async (chunk) => {
      const audioFeatures = await service.Tracks().audioFeatures(
        req,
        res,
        chunk.map((c) => c.id)
      );
      audioFeatures.data.audio_features.forEach((feature) => {
        featuresByTrack.set(feature.id, feature);
      });
    })
  );

  if (results.find((r) => r.status === "rejected")) {
    res.status(500).json({ error: "Cannot retrieve audio features" });
    return;
  }

  const clusters = cluster(
    featuresByTrack,
    savedTracks.data.items.map((i) => i.track)
  );
  console.log({ tracks });
  console.log({ clusters });

  const data = {
    ...savedTracks,
    items: savedTracks.data.items.map((item) => ({
      track: {
        ...item.track,
        artists: item.track.artists.map((artist) => ({
          ...artist,
        })),
      },
    })),
    clusters,
    error: null,
  };

  res.status(200).json(data);
}
