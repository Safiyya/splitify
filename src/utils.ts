import { AudioFeatures, SELECTED_AUDIO_FEATURES, Track } from "@/types";
import { kmeans } from "kmeans-clust";
import { isEqual, pick } from "lodash";
import * as math from "mathjs";

const featuresArray = (f: AudioFeatures, tracks: Track[]) => [
  Number.parseInt(
    tracks.find((t) => t.id === f.id)?.album.release_date.slice(0, 3) || "0000"
  ),
  ...Object.values(pick(f, ...SELECTED_AUDIO_FEATURES)),
];

const normalizeFeatures = (
  featuresByTrack: Map<string, AudioFeatures>,
  tracks: Track[]
) => {
  const features = Array.from(featuresByTrack.values()).map((x) =>
    featuresArray(x, tracks)
  );

  const normalizedFeatures = [];

  for (let i = 0; i < features[0].length; i++) {
    const column = features.map((row: number[]) => row[i]);
    const min = Math.min(...column);
    const max = Math.max(...column);
    const normalizedColumn = column.map((value) => (value - min) / (max - min));
    normalizedFeatures.push(normalizedColumn);
  }
  return normalizedFeatures;
};

const clusterTracks = (features: number[][], numberOfClusters: number) => {
  const transposed = math.transpose(math.matrix(features));
  return kmeans(transposed.valueOf() as number[][], numberOfClusters);
};

const transpose = (array: number[][]) => {
  return math.transpose(math.matrix(array)).valueOf();
};

export const cluster = (
  features: Map<string, AudioFeatures>,
  tracks: Track[]
) => {
  const normalized = normalizeFeatures(features, tracks);

  const clusters = clusterTracks(normalized, 20);

  const transposed = transpose(normalized);

  const tracksInClusters: Map<number, { error: number; tracksIds: string[] }> =
    new Map();
  clusters.forEach((cluster, clusterIndex) => {
    cluster.points.forEach((point) => {
      const index = transposed.findIndex((fa) => {
        return isEqual(fa, point);
      });
      const track = Array.from(features.keys())[index];

      tracksInClusters.set(clusterIndex, {
        error: cluster.error,
        tracksIds: [
          ...(tracksInClusters.get(clusterIndex)?.tracksIds || []),
          track,
        ],
      });
    });
  });

  return Array.from(tracksInClusters.entries()).map(
    ([index, { error, tracksIds }]) => ({
      index,
      error,
      tracks: tracks.filter((track) => tracksIds.includes(track.id)),
    })
  );
};
