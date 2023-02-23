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

export type AudioFeatures = {
  id: string;
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: 0 | 1;
  speechiness: number;
  tempo: number;
  time_signature: number;
  valence: number;
  duration_ms: number;
};
