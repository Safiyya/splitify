import { Badge, Button, Progress } from "@chakra-ui/react";
import { useContext, useState } from "react";

import {
  useGetClusterDistances,
  useGetClusters,
  useGetMetadata,
  useGetSavedTracks,
  useGetTotalTracks,
} from "@/services/api/tracks";
import TracksContext from "@/TracksContext";

import Playlists from "./Playlists";

interface LoadTracksProps {}

const LoadTracks: React.FunctionComponent<LoadTracksProps> = () => {
  const { clusters, reset } = useContext(TracksContext);

  const [loadTracksProgress, setLoadTracksProgress] = useState<number>();
  const [loadMetadataProgress, setLoadMetadataProgress] = useState<number>();
  const [loadClustersProgress, setLoadClustersProgress] = useState<number>();
  const [loadDistancesProgress, setLoadDistancesProgress] = useState<number>();

  const onLoadTracksProgress = (progress: number) => {
    setLoadTracksProgress(progress);
  };
  const onLoadMetadataProgress = (progress: number) => {
    setLoadMetadataProgress(progress);
  };
  const onLoadClustersProgress = (progress: number) => {
    setLoadClustersProgress(progress);
  };
  const onLoadDistancesProgress = (progress: number) => {
    setLoadDistancesProgress(progress);
  };

  const getSavedTracks = useGetSavedTracks(onLoadTracksProgress);
  useGetMetadata(onLoadMetadataProgress);
  useGetClusters(onLoadClustersProgress);
  useGetClusterDistances(onLoadDistancesProgress);

  const {
    isLoading: isLoadingTotalTracks,
    error: errorTotalTracks,
    data: total,
  } = useGetTotalTracks();

  const loadTracks = async () => {
    await getSavedTracks();
  };

  const resetTracks = () => {
    reset();
    onLoadTracksProgress(0);
    onLoadMetadataProgress(0);
    onLoadClustersProgress(0);
    onLoadDistancesProgress(0);
  };

  if (isLoadingTotalTracks) return null;
  if (errorTotalTracks) return <Badge>Error loading tracks</Badge>;
  return (
    <>
      <Button onClick={loadTracks}>Load {total} tracks</Button>
      <Button variant="outline" onClick={resetTracks}>
        Start again
      </Button>
      Loading tracks
      <Progress value={loadTracksProgress} />
      Loading metadata
      <Progress value={loadMetadataProgress} />
      Prepare
      <Progress value={loadDistancesProgress} />
      Loading clusters
      <Progress value={loadClustersProgress} />
      {clusters ? <Playlists clusters={clusters} /> : null}
    </>
  );
};

export default LoadTracks;
