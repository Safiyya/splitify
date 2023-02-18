import queryString from "query-string";
import type { NextApiRequest, NextApiResponse } from "next";
import { STATE_KEY } from "./constants";
const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SPOTIFY_SCOPES = process.env.SPOTIFY_SCOPES;

type Data = {};

const generateState = () => {
  return (Math.random() + 1).toString(36).substring(2);
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  var state = generateState();

  res.setHeader(
    "Set-Cookie",
    `${STATE_KEY}=${state}; Max-Age=${process.env.STATE_COOKIE_DURATION}`
  );

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      queryString.stringify({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: SPOTIFY_SCOPES,
        redirect_uri: REDIRECT_URI,
        state: state,
        show_dialog: true,
      })
  );
}
