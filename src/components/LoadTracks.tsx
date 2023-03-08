import { Badge, Button } from "@chakra-ui/react";

import { useGetClusters } from "@/services/api/clusters";
import { useGetTotalTracks } from "@/services/api/tracks";

import Playlists from "./Playlists";

interface LoadTracksProps {}

const LoadTracks: React.FunctionComponent<LoadTracksProps> = () => {
  const {
    isLoading: isLoadingClusters,
    isRefetching: isRefetchingClusters,
    error: errorClusters,
    data: clusters,
    refetch: refetchClusters,
    remove,
  } = useGetClusters();
  const {
    isLoading: isLoadingTotalTracks,
    error: errorTotalTracks,
    data: total,
  } = useGetTotalTracks();

  const loadTracks = async () => {
    remove();
    refetchClusters();
  };

  const showLoading = isLoadingClusters || isRefetchingClusters;

  if (isLoadingTotalTracks) return null;
  if (errorClusters) return <Badge>Error loading clusters</Badge>;
  if (errorTotalTracks) return <Badge>Error loading tracks</Badge>;
  return (
    <>
      <Button onClick={loadTracks} isLoading={showLoading}>
        Load {total} tracks
      </Button>
      <Button isLoading={showLoading} variant="outline" onClick={loadTracks}>
        Start again
      </Button>
      {clusters?.clusters ? <Playlists clusters={clusters.clusters} /> : null}
    </>
  );
};

export default LoadTracks;
