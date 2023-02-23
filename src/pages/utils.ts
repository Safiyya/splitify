import { AudioFeatures, SELECTED_AUDIO_FEATURES, Track } from "@/types";
import { kmeans } from "kmeans-clust";
import { isEqual, pick } from "lodash";
import math from "mathjs";

const featuresArray = (f: AudioFeatures) => [
  ...Object.values(pick(f, ...SELECTED_AUDIO_FEATURES)),
];

const normalizeFeatures = (featuresByTrack: Map<string, AudioFeatures>) => {
  const features = Array.from(featuresByTrack.values()).map(featuresArray);

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
  const normalized = normalizeFeatures(features);

  const clusters = clusterTracks(normalized, 10);

  const transposed = transpose(normalized);

  const tracksInClusters: Map<number, string[]> = new Map();
  clusters.forEach((cluster, clusterIndex) => {
    cluster.points.forEach((point) => {
      const index = transposed.findIndex((fa) => {
        return isEqual(fa, point);
      });
      const track = Array.from(features.keys())[index];

      tracksInClusters.set(clusterIndex, [
        ...(tracksInClusters.get(clusterIndex) || []),
        track,
      ]);
    });
  });

  return Array.from(tracksInClusters.entries()).map(([index, tracksIds]) => ({
    index,
    tracks: tracks.filter((track) => tracksIds.includes(track.id)),
  }));
};
