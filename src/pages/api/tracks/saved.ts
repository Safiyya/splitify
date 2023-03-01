import service from "@/services/spotify";
import { clusterByFeatures, clusterTracksByGenre } from "@/utils";
import { AudioFeatures, SavedTracksData } from "@/types";
import { chunk } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";

const LIKED_TRACKS_LIMIT = 50;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SavedTracksData | { error: any }>
) {
  // TODO : Remove in prod
  res.setHeader("Cache-Control", "no-store");

  const savedTracks = await service
    .User()
    .savedTracks(req, res, LIKED_TRACKS_LIMIT);

  if (savedTracks.status !== 200 || !savedTracks.data) {
    res.status(500).json({ error: savedTracks.error });
    return;
  }

  const tracks = savedTracks.data.items.map((t) => t.track);

  const tracksIds = tracks.map((track) => track.id);
  const tracksIdsChunks = chunk(tracksIds, 50);

  let featuresByTrack: Map<string, AudioFeatures> = new Map();
  const results = await Promise.allSettled(
    tracksIdsChunks.map(async (chunk) => {
      const audioFeatures = await service
        .Tracks()
        .audioFeatures(req, res, chunk);
      audioFeatures.data.audio_features.forEach((feature) => {
        featuresByTrack.set(feature.id, feature);
      });
    })
  );

  if (results.find((r) => r.status === "rejected")) {
    res.status(500).json({ error: "Cannot retrieve audio features" });
    return;
  }

  const clusters = []; //clusterByFeatures(featuresByTrack, tracks);
  const clustersGenres = clusterTracksByGenre(tracks);

  //   console.log({
  //     clustersGenres: clustersGenres.length,
  //     output: clustersGenres.map((tracks, clusterIndex) =>
  //       tracks
  //         .map(
  //           (t) =>
  //             `${clusterIndex} >>> ${t?.name || ""} [${(t?.genres || []).join(
  //               "|"
  //             )}]`
  //         )
  //         .join("\r\n")
  //     ),
  //   });

  const data = {
    ...tracks,
    items: tracks.map((track) => ({
      track: {
        ...track,
        artists: track.artists.map((artist) => ({
          ...artist,
        })),
      },
    })),
    clusters: clustersGenres,
    error: null,
  };

  res.status(200).json(data);
}
