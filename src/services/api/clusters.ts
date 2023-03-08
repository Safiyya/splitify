import { useQuery } from "react-query";

import { Cluster } from "@/types";

export function useGetClusters() {
  return useQuery<{ clusters: Cluster[] }, Error>(
    "clusters",
    () => fetch("/api/tracks/saved").then((res) => res.json()),
    {
      enabled: false,
    }
  );
}
