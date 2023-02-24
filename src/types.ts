export type Track = {
  id: string;
  name: string;
  album: Album;
  artists: Artist[];
  features: AudioFeatures;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  genres: string[];
};

export type SavedTrack = {
  track: Track;
};

export type Album = {
  id: string;
  genres: string[];
  release_date: string;
};

export type Artist = {
  genres?: string[];
  id: string;
  name: string;
  related?: Artist[];
  topTracks: Track[];
};

export type SavedTracksData = {
  next: string;
  previous: string;
  offset: number;
  total: number;
  items: SavedTrack[];
  clusters: {
    error: number;
    index: number;
    tracks: Track[];
  }[];
};

export const SELECTED_AUDIO_FEATURES = [
  // "acousticness",
  // "danceability",
  "energy",
  // "instrumentalness",
  // "key",
  // "liveness",
  // "loudness",
  // "mode",
  // "speechiness",
  // "tempo",
  // "time_signature",
  // "valence",
  // "duration_ms",
] as const;

// this is now the union we wanted, "name" | "age"
type SelectableAudioFeatures = typeof SELECTED_AUDIO_FEATURES[number];

export type AudioFeatures = {
  id: string;
} & {
  [key in SelectableAudioFeatures]: number;
};
