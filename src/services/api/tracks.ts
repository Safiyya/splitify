import { chunk, compact, isEmpty, uniq } from "lodash";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";

import TracksContext from "@/TracksContext";
import { Artist, RawTrack } from "@/types";
import { getClusters, getDistances, getTrackGenres } from "@/utils";

const PAGE_LIMIT = 50;

export function useGetTotalTracks() {
  return useQuery<number, Error>(
    "totalTracks",
    () => fetch("/api/tracks/total").then((res) => res.json()),
    {
      enabled: true,
    }
  );
  // return { isLoading: false, error: null, data: 1000 };
}

const fetchTracks = async (session: Session, offset: number) => {
  const response = await fetch(
    `https://api.spotify.com/v1/me/tracks?limit=${PAGE_LIMIT}&offset=${offset}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    }
  );

  if (response.status === 200) {
    const data = await response.json();
    return {
      offset: (data.offset + PAGE_LIMIT) as number,
      items: data.items.map((i: any) => i.track) as RawTrack[],
    };
  } else {
    throw Error("Cannot retrieve tracks");
  }
};

const fetchArtists = async (session: Session, artistsIds: string[]) => {
  const response = await fetch(
    `https://api.spotify.com/v1/artists?ids=${artistsIds?.join(",")}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    }
  );

  if (response.status === 200) {
    const data = await response.json();
    return {
      artists: data.artists as Artist[],
    };
  } else {
    return {
      artists: [],
    };
  }
};

export function useGetSavedTracks(onProgress: (progress: number) => void) {
  const { data: session } = useSession();
  const { rawTracks, setRawTracks, setIsTracksReady } =
    useContext(TracksContext);
  const [offset, setOffset] = useState<number>(0);

  if (!session) {
    throw Error("No session available");
  }

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
        onProgress(total ? (data.offset / total) * 100 : 0);
      },
      enabled: offset > 0,
    }
  );

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
        onProgress(index ? (index + 1 / artistsIdsChunks.length) * 100 : 0);
      },
      enabled: index >= 0 && !isEmpty(artistsIds) && isTracksReady,
    }
  );

  useEffect(() => {
    setIsArtistsReady(index === artistsIdsChunks.length - 1 || index === -1);
  }, [setIsArtistsReady, index, artistsIdsChunks.length, artistsIdsChunks]);
};

export const useGetClusters = (onProgress: (progress: number) => void) => {
  const {
    tracks,
    isTracksReady,
    isArtistsReady,
    setClusters,
    setIsReady,
    isReady,
  } = useContext(TracksContext);

  const [progress, setProgress] = useState(0);

  const _onProgress = useCallback(
    (progress: number) => {
      setProgress(progress);
    },
    [setProgress]
  );

  useEffect(() => {
    onProgress(progress);
  }, [onProgress, progress]);

  const updateProgress = useCallback(
    async (progress: number) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      _onProgress(progress);
    },
    [_onProgress]
  );

  useEffect(() => {
    if (isEmpty(tracks)) return;
    if (!isTracksReady || !isArtistsReady) return;
    if (isReady) return;

    const calculateClusters = async () => {
      const genres = getTrackGenres(tracks);
      await updateProgress(33);
      const distances = getDistances(genres);
      await updateProgress(66);
      const clusters = getClusters(tracks, distances);
      await updateProgress(100);
      setClusters(clusters);
      setIsReady(true);
    };

    calculateClusters();
  }, [
    tracks,
    isArtistsReady,
    isTracksReady,
    setClusters,
    updateProgress,
    isReady,
    setIsReady,
  ]);
};
