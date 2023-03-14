import { isEmpty, startCase } from "lodash";
import { useCallback, useEffect, useRef } from "react";

import { Cluster } from "@/types";

export const useGetPlaylistName = (cluster: Cluster) => {
  if (isEmpty(cluster.genres)) return "Unnamed";
  return Object.entries(cluster.genres)
    .slice(0, 5)
    .map(([genre, _total]) => startCase(genre))
    .join(" - ");
};

export const useUpdateProgress = (onProgress: (progress: number) => void) => {
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  const updateProgress = useCallback(async (progress: number) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    onProgressRef.current(progress);
  }, []);

  return updateProgress;
};
