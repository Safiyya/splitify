import { Cluster } from "@/types";
import { useQuery } from "react-query";

export function useGetClusters() {
  return useQuery<{ clusters: Cluster[] }, Error>(
    "clusters",
    () => fetch("/api/tracks/saved").then((res) => res.json()),
    {
      enabled: false,
    }
  );
}
