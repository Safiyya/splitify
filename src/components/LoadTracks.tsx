import { Badge, Button, Progress } from "@chakra-ui/react";
import { useContext, useState } from "react";

import {
  useGetClusters,
  useGetMetadata,
  useGetSavedTracks,
  useGetTotalTracks,
} from "@/services/api/tracks";
import TracksContext from "@/TracksContext";

import Playlists from "./Playlists";

interface LoadTracksProps {}

const LoadTracks: React.FunctionComponent<LoadTracksProps> = () => {
  const { tracks, clusters, isArtistsReady, isTracksReady } =
    useContext(TracksContext);

  const [loadTracksProgress, setLoadTracksProgress] = useState<number>();
  const [loadMetadataProgress, setLoadMetadataProgress] = useState<number>();
  const [loadClustersProgress, setLoadClustersProgress] = useState<number>();

  const onLoadTracksProgress = (progress: number) => {
    setLoadTracksProgress(progress);
  };
  const onLoadMetadataProgress = (progress: number) => {
    setLoadMetadataProgress(progress);
  };
  const onLoadClustersProgress = (progress: number) => {
    setLoadClustersProgress(progress);
  };

  const getSavedTracks = useGetSavedTracks(onLoadTracksProgress);
  useGetMetadata(onLoadMetadataProgress);
  useGetClusters(onLoadClustersProgress);

  const {
    isLoading: isLoadingTotalTracks,
    error: errorTotalTracks,
    data: total,
  } = useGetTotalTracks();

  const loadTracks = async () => {
    await getSavedTracks();
  };

  if (isLoadingTotalTracks) return null;
  if (errorTotalTracks) return <Badge>Error loading tracks</Badge>;
  return (
    <>
      <Button onClick={loadTracks}>Load {total} tracks</Button>
      <Button variant="outline">Start again</Button>
      Loading tracks {loadTracksProgress}
      <Progress value={loadTracksProgress} />
      Loading metadata {loadMetadataProgress}
      <Progress value={loadMetadataProgress} />
      Loading clusters {loadClustersProgress}
      <Progress value={loadClustersProgress} />
      {clusters ? <Playlists clusters={clusters} /> : null}
    </>
  );
};

export default LoadTracks;
