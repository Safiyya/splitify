import { getTopTracks } from "./artists";
import { getAudioFeatures } from "./tracks";
import { getSavedTracks, getTotalSavedTracks } from "./user";

export class SpotifyService {
  User = () => {
    return {
      savedTracks: getSavedTracks,
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
}

const service = new SpotifyService();
export default service;
