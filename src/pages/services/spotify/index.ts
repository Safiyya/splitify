import { getTopTracks } from "./artists";
import { getAudioFeatures } from "./tracks";
import { getSavedTracks } from "./user";

export class SpotifyService {
  User = () => {
    return {
      savedTracks: getSavedTracks,
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
