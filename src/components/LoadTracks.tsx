import { SavedTracksData } from "@/types";
import { Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface LoadTracksProps {}

const LoadTracks: React.FunctionComponent<LoadTracksProps> = () => {
  const [loading, setLoading] = useState<boolean>(true);

  const [total, setTotal] = useState<number>();
  const [clusters, setClusters] = useState<SavedTracksData["clusters"]>();

  const getTotal = async () => {
    const response = await fetch("/api/tracks/total");
    const data: { total: number } = await response.json();
    return data.total;
  };

  const getClusters = async () => {
    const response = await fetch("/api/tracks/saved");
    const data: SavedTracksData = await response.json();
    return data;
  };

  useEffect(() => {
    setLoading(true);
    getTotal()
      .then((total) => {
        setTotal(total);
      })
      .then(() => {
        setLoading(false);
      });
  }, []);

  const loadTracks = async () => {
    const data = await getClusters();
    setClusters(data.clusters);
  };

  if (loading) return null;
  return (
    <>
      <Button onClick={loadTracks}>Load {total} tracks</Button>
      {clusters && <>{clusters.data.length} playlists</>}
    </>
  );
};

export default LoadTracks;
