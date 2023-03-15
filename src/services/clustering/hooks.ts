import { chunk, compact, isEmpty, uniq } from "lodash";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";

import { useUpdateProgress } from "@/components/hooks";
import { PAGE_LIMIT } from "@/constants";
import {
  getClusters,
  getDistances,
  getTrackGenres,
} from "@/services/clustering/utils";
import TracksContext from "@/TracksContext";
import { Artist, RawTrack } from "@/types";

import { fetchArtists } from "../api/artists";
import { fetchTracks, useGetTotalTracks } from "../api/tracks";

export function useGetSavedTracks(onProgress: (_progress: number) => void) {
  const { data: session } = useSession();
  const { rawTracks, setRawTracks, setIsTracksReady } =
    useContext(TracksContext);
  const [offset, setOffset] = useState<number>(0);
  const [next, setNext] = useState<string>();

  if (!session) {
    throw Error("No session available");
  }

  const updateProgress = useUpdateProgress(onProgress);

  const { data: total } = useGetTotalTracks();

  const { refetch } = useQuery(
    ["tracks", offset],
    () => fetchTracks(session, offset),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      notifyOnChangeProps: ["isLoading", "data"],
      onSuccess: (data: {
        offset: number;
        items: RawTrack[];
        next: string;
      }) => {
        setRawTracks(compact([...rawTracks, ...data.items]));
        setNext(data.next);
        setOffset(offset + PAGE_LIMIT);
        updateProgress(total ? (data.offset / total) * 100 : 0);
        if (!data.next) {
          setOffset(0);
        }
      },
      enabled: offset > 0 && !!next,
    }
  );

  useEffect(() => {
    setIsTracksReady(!next);
  }, [setIsTracksReady, next]);

  return refetch;
}

export const useGetMetadata = (onProgress: (_progress: number) => void) => {
  const { data: session } = useSession();

  if (!session) {
    throw Error("No session available");
  }

  const { rawTracks, isTracksReady, artists, setArtists, setIsArtistsReady } =
    useContext(TracksContext);

  const updateProgress = useUpdateProgress(onProgress);

  const [index, setIndex] = useState<number>(0);
  const [next, setNext] = useState<boolean>(true);
  const artistsIds = uniq(
    compact(rawTracks)
      .map((t) => t.artists.map((a) => a?.id))
      .flat()
  );
  const artistsIdsChunks = chunk(artistsIds, 50);
  const N = artistsIdsChunks.length;

  useQuery(
    ["artists", artistsIdsChunks[index]],
    () => fetchArtists(session, artistsIdsChunks[index]),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      notifyOnChangeProps: ["isLoading", "data"],
      onSuccess: (data: { artists: Artist[] }) => {
        setIndex(index + 1);
        setNext(!artistsIdsChunks[index] ? false : true);
        setArtists(compact([...artists, ...(data.artists || [])]));

        updateProgress(index ? (index / N) * 100 : 0);
        if (!next) {
          setIndex(0);
        }
      },
      enabled: index >= 0 && !isEmpty(artistsIds) && !!next && isTracksReady,
    }
  );

  useEffect(() => {
    setIsArtistsReady(index === N);
  }, [setIsArtistsReady, index, N]);
};

export const useGetClusterDistances = (
  onProgress: (_progress: number) => void
) => {
  const {
    tracks,
    setDistances,
    isTracksReady,
    isArtistsReady,
    setIsDistancesReady,
  } = useContext(TracksContext);

  const updateProgress = useUpdateProgress(onProgress);

  useEffect(() => {
    if (isEmpty(tracks)) return;
    if (!isTracksReady || !isArtistsReady) return;

    updateProgress(10);

    const calculateGenres = async () => {
      const genres = await getTrackGenres(tracks);
      updateProgress(50);
      return genres;
    };
    const calculateDistances = async (genres: string[][]) => {
      const distances = getDistances(genres);
      setDistances(distances);
      updateProgress(100);
    };

    calculateGenres()
      .then((genres) => calculateDistances(genres))
      .then(() => {
        setIsDistancesReady(true);
      });
  }, [
    updateProgress,
    tracks,
    isArtistsReady,
    isTracksReady,
    setDistances,
    setIsDistancesReady,
  ]);
};

export const useGetClusters = (onProgress: (_progress: number) => void) => {
  const {
    tracks,
    isTracksReady,
    isArtistsReady,
    setClusters,
    setIsReady,
    isReady,
    distances,
    isDistancesReady,
  } = useContext(TracksContext);

  const updateProgress = useUpdateProgress(onProgress);

  useEffect(() => {
    if (isEmpty(tracks)) return;
    if (!isTracksReady || !isArtistsReady || !isDistancesReady) return;
    if (isReady) return;

    const calculateClusters = async () => {
      return getClusters(tracks, distances, updateProgress);
    };

    calculateClusters().then((clusters) => {
      setClusters(clusters);
      setIsReady(true);
    });
  }, [
    tracks,
    isArtistsReady,
    isTracksReady,
    setClusters,
    isReady,
    updateProgress,
    setIsReady,
    distances,
    isDistancesReady,
  ]);
};
