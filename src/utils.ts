import { AudioFeatures, SELECTED_AUDIO_FEATURES, Track } from "@/types";
import { kmeans } from "kmeans-clust";
import { isEqual, pick } from "lodash";
import * as math from "mathjs";
import { index } from "mathjs";

const featuresArray = (f: AudioFeatures, tracks: Track[]) => [
  // Number.parseInt(
  //   tracks.find((t) => t.id === f.id)?.album.release_date.slice(0, 3) || "0000"
  // ),
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

// export const clusterByGenres = (tracks: Track[]) => {
//   const genres = Array.from(new Set(tracks.map((t) => t.genres).flat()));
//   console.log(genres);

//   const matrix: number[][] = [];

//   tracks.forEach((track, i) => {
//     const indexesForTrack: number[] = [];
//     console.log(i, track.name, track.genres);
//     track.genres.forEach((trackGenre) => {
//       const indexes = genres.reduce(function (a, genre, i) {
//         if (genre === trackGenre) a.push(i);
//         return a;
//       }, [] as number[]);
//       indexesForTrack.push(...indexes);
//     });
//     matrix[i] = Array.from(new Set(indexesForTrack));
//   });

//   console.log(matrix);
// };

export const clusterByFeatures = (
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

const genresKey = (genres: string[]) => genres.sort().join("|");

export function clusterTracksByGenre(tracks: Track[]): Track[][] {
  const start = Date.now();
  console.log("# Start", Date.now() - start);
  const trackGenres = tracks.map((track) => track.genres);
  // const distances: number[][] = [];
  const genresMap: Map<{ genresRow: string; genresColumn: string }, number> =
    new Map();

  console.log("# Calculate distances", Date.now() - start);

  for (let i = 0; i < trackGenres.length; i++) {
    // const row = [];
    for (let j = 0; j < trackGenres.length; j++) {
      const distance = 1 - jaccardDistance(trackGenres[i], trackGenres[j]);
      // row.push(distance);
      genresMap.set(
        {
          genresRow: genresKey(trackGenres[i]),
          genresColumn: genresKey(trackGenres[j]),
        },
        distance
      );
    }
    // distances.push(row);
  }

  console.log("# Calculate clusters", Date.now() - start);
  const clusters = hierarchicalClustering(genresMap, tracks, 0.95);

  console.log("# Return clusters", Date.now() - start);
  return clusters;
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
  genresMap: Map<{ genresRow: string; genresColumn: string }, number>,
  objects: Track[],
  thresholdDistance: number
): Track[][] {
  const clusters = objects.map((obj) => [obj]);

  while (true) {
    let minDistance = Infinity;
    let closestClusters = [-1, -1];
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const distance = clusterDistance(clusters[i], clusters[j], genresMap);
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
  }

  return clusters;
}

function clusterDistance(
  clusterA: Track[],
  clusterB: Track[],
  genresMap: Map<{ genresRow: string; genresColumn: string }, number>
): number {
  let sum = 0;
  clusterA.forEach((objA) => {
    clusterB.forEach((objB) => {
      const col = genresKey(objA.genres);
      const row = genresKey(objB.genres);
      const found = Array.from(genresMap.entries()).find(
        ([{ genresRow, genresColumn }, value]) =>
          genresRow === row && genresColumn === col
      )?.[1];

      genresMap.get({
        genresRow: row,
        genresColumn: col,
      });

      sum += found || 0;
    });
  });
  return sum / (clusterA.length * clusterB.length);
}
