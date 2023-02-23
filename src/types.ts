export type Track = {
  id: string;
  name: string;
  album: Album;
  artists: Artist[];
  features: AudioFeatures;
};

export type SavedTrack = {
  track: Track;
};

export type Album = {
  id: string;
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
  clusters: any;
};

export const SELECTED_AUDIO_FEATURES = [
  "acousticness",
  "danceability",
  "energy",
  "instrumentalness",
  "key",
  "liveness",
  "loudness",
  "mode",
  "speechiness",
  "tempo",
  "time_signature",
  "valence",
  "duration_ms",
] as const;

// this is now the union we wanted, "name" | "age"
type SelectableAudioFeatures = typeof SELECTED_AUDIO_FEATURES[number];

export type AudioFeatures = {
  id: string;
} & {
  [key in SelectableAudioFeatures]: number;
};
