import { Badge, Button } from "@chakra-ui/react";
import { useContext, useState } from "react";

import { useGetTotalTracks } from "@/services/api/tracks";
import {
  useGetClusterDistances,
  useGetClusters,
  useGetMetadata,
  useGetSavedTracks,
} from "@/services/clustering";
import TracksContext from "@/TracksContext";

import Playlists from "./Playlists";
import ProgressBar from "./ProgressBar";

interface LoadTracksProps {}

const LoadTracks: React.FunctionComponent<LoadTracksProps> = () => {
  const { clusters, reset } = useContext(TracksContext);

  const [loadTracksProgress, setLoadTracksProgress] = useState<number>(0);
  const [loadMetadataProgress, setLoadMetadataProgress] = useState<number>(0);
  const [loadClustersProgress, setLoadClustersProgress] = useState<number>(0);
  const [loadDistancesProgress, setLoadDistancesProgress] = useState<number>(0);

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
    reset();
    onLoadTracksProgress(0);
    onLoadMetadataProgress(0);
    onLoadClustersProgress(0);
    onLoadDistancesProgress(0);
    await getSavedTracks();
  };

  if (isLoadingTotalTracks) return null;
  if (errorTotalTracks) return <Badge>Error loading tracks</Badge>;
  return (
    <>
      <Button onClick={loadTracks}>Load {total} tracks</Button>

      <ProgressBar
        my={2}
        title="Loading tracks"
        progress={loadTracksProgress}
      />
      <ProgressBar
        my={2}
        title="Loading metadata"
        progress={loadMetadataProgress}
      />
      <ProgressBar my={2} title="Prepare" progress={loadDistancesProgress} />
      <ProgressBar
        my={2}
        title="Loading clusters"
        progress={loadClustersProgress}
      />

      {clusters ? <Playlists clusters={clusters} /> : null}
    </>
  );
};

export default LoadTracks;
