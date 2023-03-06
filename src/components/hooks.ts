import { Cluster } from "@/types";
import { isEmpty, startCase } from "lodash";

export const useGetPlaylistName = (cluster: Cluster) => {
  if (isEmpty(cluster.genres)) return "Unnamed";
  return Object.entries(cluster.genres)
    .slice(0, 5)
    .map(([genre, _total]) => startCase(genre))
    .join(" - ");
};
