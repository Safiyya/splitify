import { AudioFeatures, SavedTracksData, Track } from "@/types";
import { kmeans } from "kmeans-clust";
import { chunk, isEqual, pick } from "lodash";
import * as math from "mathjs";
import type { NextApiRequest, NextApiResponse } from "next";
import { ACCESS_TOKEN_KEY } from "../auth/constants";

const LIKED_TRACKS_LIMIT = 50;
const ARTISTS_LIMIT = 5;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SavedTracksData>
) {
  const accessToken = req.cookies[ACCESS_TOKEN_KEY];

  const responseSavedTracks = await fetch(
    `https://api.spotify.com/v1/me/tracks?limit=${LIKED_TRACKS_LIMIT}&offset=50`,
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
    .map((a) => a.id)
    .slice(0, ARTISTS_LIMIT);

  let topTracksByArtist: Map<string, Track[]> = new Map();
  const tracks: Track[] = [];
  await Promise.all(
    artistsIds.map(async (artistId) => {
      const responseTopTracks = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=GB`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(
        2,
        artistId,
        responseTopTracks.status,
        responseTopTracks.headers.get("retry-after")
      );
      const data = await responseTopTracks.json();
      tracks.push(...data.tracks);
      topTracksByArtist.set(artistId, data.tracks);
    })
  );

  let featuresByTrack: Map<string, AudioFeatures> = new Map();
  const tracksIds = Array.from(topTracksByArtist.values())
    .flat()
    .map((track) => track.id);
  const tracksIdsChunks = chunk(tracksIds, 50);

  await Promise.all(
    tracksIdsChunks.map(async (chunk) => {
      const responseAudioFeatures = await fetch(
        `https://api.spotify.com/v1/audio-features?ids=${chunk.join(",")}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = (await responseAudioFeatures.json())
        .audio_features as AudioFeatures[];

      data.forEach((feature) => {
        featuresByTrack.set(feature.id, feature);
      });
    })
  );

  const featuresArray = (f: AudioFeatures) => [
    ...Object.values(
      pick(
        f,
        "danceability",
        "acousticness",
        "energy"
        // "instrumentalness",
        // "liveness"
      )
    ),
  ];

  // Normalise features
  function normalizeFeatures(featuresByTrack: Map<string, AudioFeatures>) {
    const features = Array.from(featuresByTrack.values()).map(featuresArray);

    const normalizedFeatures = [];

    for (let i = 0; i < features[0].length; i++) {
      const column = features.map((row: number[]) => row[i]);
      const min = Math.min(...column);
      const max = Math.max(...column);
      const normalizedColumn = column.map(
        (value) => (value - min) / (max - min)
      );
      normalizedFeatures.push(normalizedColumn);
    }
    return normalizedFeatures;
  }

  const normalisedFeatures = normalizeFeatures(featuresByTrack);

  function clusterTracks(features: number[][]) {
    const transposed = math.transpose(math.matrix(features));
    return kmeans(transposed.valueOf() as number[][], 10);
  }

  const clusters = clusterTracks(normalisedFeatures);

  const transposedNormalisedFeatures = math.transpose(
    math.matrix(normalisedFeatures)
  );

  const clusteredTrack: Map<number, string[]> = new Map();
  clusters.forEach((cluster, clusterIndex) => {
    cluster.points.forEach((point) => {
      const index = transposedNormalisedFeatures.valueOf().findIndex((fa) => {
        return isEqual(fa, point);
      });
      const track = Array.from(featuresByTrack.keys())[index];

      clusteredTrack.set(clusterIndex, [
        ...(clusteredTrack.get(clusterIndex) || []),
        track,
      ]);
    });
  });

  const data = {
    ...savedTracks,
    items: savedTracks.items.map((item) => ({
      track: {
        ...item.track,
        artists: item.track.artists.map((artist) => ({
          ...artist,
        })),
      },
    })),
    clusters: Array.from(clusteredTrack.entries()).map(
      ([index, tracksIds]) => ({
        index,
        tracks: tracks.filter((track) => tracksIds.includes(track.id)),
      })
    ),
  };

  //   res.setHeader("Cache-Control", "no-store");
  res.status(200).json(data);
}
