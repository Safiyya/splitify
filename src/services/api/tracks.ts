import { useQuery } from "react-query";

export function useGetTotalTracks() {
  return useQuery<number, Error>("totalTracks", () =>
    fetch("/api/tracks/total").then((res) => res.json())
  );
}
