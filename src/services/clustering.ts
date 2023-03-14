import { chunk, compact, isEmpty, uniq } from "lodash";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";

import { useUpdateProgress } from "@/components/hooks";
import { PAGE_LIMIT } from "@/constants";
import TracksContext from "@/TracksContext";
import { Artist, RawTrack } from "@/types";
import { getClusters, getDistances, getTrackGenres } from "@/utils";

import { fetchArtists } from "./api/artists";
import { fetchTracks, useGetTotalTracks } from "./api/tracks";

export function useGetSavedTracks(onProgress: (progress: number) => void) {
  const { data: session } = useSession();
  const { rawTracks, setRawTracks, setIsTracksReady } =
    useContext(TracksContext);
  const [offset, setOffset] = useState<number>(0);

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
      onSuccess: (data: { offset: number; items: RawTrack[] }) => {
        setRawTracks([...rawTracks, ...data.items]);
        setOffset(
          offset + PAGE_LIMIT > (total || Infinity) ? -1 : offset + PAGE_LIMIT
        );
        updateProgress(total ? (data.offset / total) * 100 : 0);
      },
      enabled: offset > 0,
    }
  );

  // TODO: rely on status rather than offset=== -1
  useEffect(() => {
    setIsTracksReady(offset === -1);
  }, [setIsTracksReady, offset]);

  return refetch;
}

export const useGetMetadata = (onProgress: (progress: number) => void) => {
  const { data: session } = useSession();

  if (!session) {
    throw Error("No session available");
  }

  const { rawTracks, isTracksReady, artists, setArtists, setIsArtistsReady } =
    useContext(TracksContext);

  const updateProgress = useUpdateProgress(onProgress);

  const [index, setIndex] = useState<number>(0);
  const artistsIds = uniq(
    compact(rawTracks)
      .map((t) => t.artists.map((a) => a?.id))
      .flat()
  );
  const artistsIdsChunks = chunk(artistsIds, 50);

  useQuery(
    ["artists", artistsIdsChunks[index]],
    () => fetchArtists(session, artistsIdsChunks[index]),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      notifyOnChangeProps: ["isLoading", "data"],
      onSuccess: (data: { artists: Artist[] }) => {
        setIndex((index) => {
          return index < artistsIdsChunks.length - 1 ? index + 1 : -1;
        });
        setArtists([...artists, ...(data.artists || [])]);

        updateProgress(
          index ? ((index + 1) / artistsIdsChunks.length) * 100 : 0
        );
      },
      enabled: index >= 0 && !isEmpty(artistsIds) && isTracksReady,
    }
  );

  // TODO: rely on status rather than index=== -1
  useEffect(() => {
    setIsArtistsReady(index === artistsIdsChunks.length || index === -1);
  }, [setIsArtistsReady, index, artistsIdsChunks.length]);
};

export const useGetClusterDistances = (
  onProgress: (progress: number) => void
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

export const useGetClusters = (onProgress: (progress: number) => void) => {
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
