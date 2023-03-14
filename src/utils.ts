import { countBy, fromPairs, orderBy, pick, sortBy, toPairs } from "lodash";

import { MIN_DISTANCE } from "./constants";
import { Track } from "./types";

const genresKey = (genres: string[]) => genres.sort().join("|");

const hashCode = function (str: string) {
  var hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const distanceKey = (row: string, col: string) => {
  return hashCode(row) + hashCode(col);
};

export const getTrackGenres = (tracks: Track[]) => {
  return tracks.map((track) => track.genres.map((g) => g.trim()));
};

export const getDistances = (trackGenres: string[][]) => {
  const distances: Map<number, number> = new Map();
  for (let i = 0; i < trackGenres.length; i++) {
    for (let j = 0; j < trackGenres.length; j++) {
      const distance = 1 - jaccardDistance(trackGenres[i], trackGenres[j]);
      distances.set(
        distanceKey(genresKey(trackGenres[i]), genresKey(trackGenres[j])),
        distance
      );
    }
  }
  return distances;
};

export const getClusters = async (
  tracks: Track[],
  distances: Map<number, number>,
  onProgress: (progress: number) => Promise<void>
) => {
  const clusters = await hierarchicalClustering(
    distances,
    tracks,
    MIN_DISTANCE,
    onProgress
  );

  const augmentedClusters = clusters.map((cluster, index) => ({
    index,
    name: `Cluster ${index}`,
    genres: fromPairs(
      sortBy(
        toPairs(countBy(cluster.map((t) => t.genres).flat(), (x) => x)),
        1
      ).reverse()
    ),
    tracks: cluster.map((track) => {
      return pick(
        track,
        "id",
        "name",
        "uri",
        "genres",
        "album.name",
        "artists",
        "artists.name"
      ) as Track;
    }),
  }));

  return orderBy(augmentedClusters, (c) => c.tracks.length, "desc");
};

function jaccardDistance(set1: string[], set2: string[]): number {
  if (set1.length === 0 && set2.length === 0) {
    return 1;
  }

  const intersection = new Set(set1.filter((x) => set2.includes(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

async function hierarchicalClustering(
  distances: Map<number, number>,
  objects: Track[],
  thresholdDistance: number,
  onProgress: (progress: number) => Promise<void>
): Promise<Track[][]> {
  const clusters = objects.map((obj) => [obj]);

  const memoizedDistances = new Array(clusters.length);
  for (let i = 0; i < clusters.length; i++) {
    memoizedDistances[i] = new Array(clusters.length);
  }

  const numIterations = clusters.length - 1;
  let completedIterations = 0;

  while (true) {
    let minDistance = Infinity;
    let closestClusters = [-1, -1];

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        let distance = memoizedDistances[i][j];
        if (distance === undefined) {
          distance = clusterDistance(clusters[i], clusters[j], distances);
          memoizedDistances[i][j] = distance;
        }
        if (distance < minDistance) {
          minDistance = distance;
          closestClusters = [i, j];
        }
      }
    }

    if (minDistance >= thresholdDistance) {
      await onProgress(100);
      break;
    }

    clusters[closestClusters[0]] = clusters[closestClusters[0]].concat(
      clusters[closestClusters[1]]
    );
    clusters.splice(closestClusters[1], 1);

    // Clear memoized distances for deleted cluster
    memoizedDistances.splice(closestClusters[1], 1);
    for (let i = 0; i < memoizedDistances.length; i++) {
      memoizedDistances[i].splice(closestClusters[1], 1);
    }

    completedIterations++;
    const progress = (completedIterations / numIterations) * 100;
    console.log("# progress", { progress });
    await onProgress(progress);
  }

  return clusters;
}

function clusterDistance(
  clusterA: Track[],
  clusterB: Track[],
  distances: Map<number, number>
): number {
  let sum = 0;
  clusterA.forEach((objA) => {
    clusterB.forEach((objB) => {
      const col = genresKey(objA.genres);
      const row = genresKey(objB.genres);
      const key = distanceKey(row, col);

      const found = distances.get(key);
      sum += found || 0;
    });
  });
  return sum / (clusterA.length * clusterB.length);
}
