import {
  countBy,
  fromPairs,
  orderBy,
  pick,
  sortBy,
  toPairs,
  uniq,
} from "lodash";
import { MIN_DISTANCE } from "./constants";
import { Cluster, Track } from "./types";

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

export function clusterTracksByGenre(tracks: Track[]): Cluster[] {
  const start = Date.now();
  console.log("# Start", Date.now() - start);
  const trackGenres = tracks.map((track) => track.genres.map((g) => g.trim()));
  const distances: Map<number, number> = new Map();

  console.log("# Calculate distances", Date.now() - start);

  for (let i = 0; i < trackGenres.length; i++) {
    for (let j = 0; j < trackGenres.length; j++) {
      const distance = 1 - jaccardDistance(trackGenres[i], trackGenres[j]);
      distances.set(
        distanceKey(genresKey(trackGenres[i]), genresKey(trackGenres[j])),
        distance
      );
    }
  }

  console.log("# Calculate clusters", Date.now() - start);
  const clusters = hierarchicalClustering(distances, tracks, MIN_DISTANCE);

  console.log("# Return clusters", Date.now() - start);
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
      // return {
      //   ...pick(track, ...Object.keys(cluster[0])),
      //   album: pick(track.album, ...Object.keys(cluster[0].album)),
      // } as Track;
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
}

function jaccardDistance(set1: string[], set2: string[]): number {
  if (set1.length === 0 && set2.length === 0) {
    return 1;
  }

  const intersection = new Set(set1.filter((x) => set2.includes(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

function hierarchicalClustering(
  distances: Map<number, number>,
  objects: Track[],
  thresholdDistance: number
): Track[][] {
  const clusters = objects.map((obj) => [obj]);

  const memoizedDistances = new Array(clusters.length);
  for (let i = 0; i < clusters.length; i++) {
    memoizedDistances[i] = new Array(clusters.length);
  }

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
