import { compact, intersectionBy } from "lodash";
import React, { ReactNode, useMemo, useState } from "react";

import { Artist, Cluster, RawTrack, Track } from "@/types";

export type TracksContextType = {
  rawTracks: RawTrack[];
  setRawTracks: React.Dispatch<React.SetStateAction<RawTrack[]>>;

  isTracksReady: boolean;
  setIsTracksReady: React.Dispatch<React.SetStateAction<boolean>>;

  isArtistsReady: boolean;
  setIsArtistsReady: React.Dispatch<React.SetStateAction<boolean>>;

  artists: Artist[];
  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;

  tracks: Track[];

  clusters: Cluster[] | null;
  setClusters: React.Dispatch<React.SetStateAction<Cluster[] | null>>;
  isReady: boolean;
  setIsReady: React.Dispatch<React.SetStateAction<boolean>>;

  reset: () => void;
};

const TracksContext = React.createContext<TracksContextType>({
  rawTracks: [],
  setRawTracks: () => {},
  isTracksReady: false,
  setIsTracksReady: () => {},
  isArtistsReady: false,
  setIsArtistsReady: () => {},
  artists: [],
  setArtists: () => {},
  tracks: [],
  clusters: [],
  setClusters: () => {},
  isReady: false,
  setIsReady: () => {},
  reset: () => {},
});

export const TracksContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [rawTracks, setRawTracks] = useState<RawTrack[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isTracksReady, setIsTracksReady] = useState<boolean>(false);
  const [isArtistsReady, setIsArtistsReady] = useState<boolean>(false);
  const [clusters, setClusters] = useState<Cluster[] | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  const tracks = useMemo(() => {
    if (!isTracksReady || !isArtistsReady) return [];
    return rawTracks.map((track) => ({
      ...track,
      genres: compact(
        intersectionBy(artists, track.artists, (a) => a?.id)
          .map((a) => a.genres)
          .flat()
      ),
    }));
  }, [isTracksReady, isArtistsReady, rawTracks, artists]);

  const reset = () => {
    setIsTracksReady(false);
    setIsArtistsReady(false);
    setRawTracks([]);
    setArtists([]);
    setClusters([]);
  };

  const state = {
    rawTracks,
    setRawTracks,
    isTracksReady,
    setIsTracksReady,
    artists,
    setArtists,
    isArtistsReady,
    setIsArtistsReady,
    tracks,
    clusters,
    setClusters,
    isReady,
    setIsReady,
    reset,
  };

  return (
    <TracksContext.Provider value={state}>{children}</TracksContext.Provider>
  );
};

export default TracksContext;
