import { getTopTracks } from "./artists";
import { createPlaylist } from "./playlists";
import { getAudioFeatures } from "./tracks";
import { getTotalSavedTracks } from "./user";

export class SpotifyService {
  User = () => {
    return {
      totalSavedTracks: getTotalSavedTracks,
    };
  };
  Artists = () => {
    return {
      getTopTracks: getTopTracks,
    };
  };
  Tracks = () => {
    return {
      audioFeatures: getAudioFeatures,
    };
  };
  Playlists = () => {
    return {
      create: createPlaylist,
    };
  };
}

const service = new SpotifyService();
export default service;
