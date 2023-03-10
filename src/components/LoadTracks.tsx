import { Badge, Button, Progress } from "@chakra-ui/react";
import { useContext, useState } from "react";

import { useGetClusters } from "@/services/api/clusters";
import {
  useGetMetadata,
  useGetSavedTracks,
  useGetTotalTracks,
} from "@/services/api/tracks";
import TracksContext from "@/TracksContext";

import Playlists from "./Playlists";

interface LoadTracksProps {}

const LoadTracks: React.FunctionComponent<LoadTracksProps> = () => {
  const { tracks } = useContext(TracksContext);

  const [loadTracksProgress, setLoadTracksProgress] = useState<number>();
  const [loadMetadataProgress, setLoadMetadataProgress] = useState<number>();

  const onLoadTracksProgress = (progress: number) => {
    setLoadTracksProgress(progress);
  };
  const onLoadMetadataProgress = (progress: number) => {
    setLoadMetadataProgress(progress);
  };

  const getSavedTracks = useGetSavedTracks(onLoadTracksProgress);
  useGetMetadata(onLoadMetadataProgress);

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
    await getSavedTracks();
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
      <Button isLoading={showLoading} variant="outline">
        Start again
      </Button>
      Loading tracks
      <Progress value={loadTracksProgress} />
      Loading metadata
      <Progress value={loadMetadataProgress} />
      {clusters?.clusters ? <Playlists clusters={clusters.clusters} /> : null}
    </>
  );
};

export default LoadTracks;
