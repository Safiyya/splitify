export type Track = {
  uri: string;
  id: string;
  name: string;
  album: Album;
  artists: Artist[];
  features: AudioFeatures;
  genres: string[];
};

export type SavedTrack = {
  track: Track;
};

export type Album = {
  id: string;
  name: string;
  genres: string[];
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  release_date: string;
};

export type Artist = {
  genres?: string[];
  id: string;
  name: string;
  related?: Artist[];
  topTracks: Track[];
};

export type Cluster = {
  name: string;
  tracks: Track[];
  genres: { [key: string]: number };
  meta?: Record<string, string>;
};

export type SavedTracksData = {
  next: string;
  previous: string;
  offset: number;
  total: number;
  clusters: Cluster[];
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

export type Playlist = {
  id: string;
  name: string;
  description: string;
};
