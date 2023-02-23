// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import queryString from "query-string";
import {
  STATE_KEY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "../../../constants";

type Data = {
  isAuthenticated: boolean;
};

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[STATE_KEY] : null;

  if (!REDIRECT_URI) {
    res.redirect(
      "/#" +
        queryString.stringify({
          error: "redirect_uri_missing",
        })
    );
    return;
  }

  if (code === null || Array.isArray(code)) {
    res.redirect(
      "/#" +
        queryString.stringify({
          error: "code_missing",
        })
    );
    return;
  }

  if (!state) {
    res.redirect(
      "/#" +
        queryString.stringify({
          error: "state_missing",
        })
    );
  }

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        queryString.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    // TODO : Improve remove state from cookies (this below does not work)
    res.setHeader("Set-Cookie", `${STATE_KEY}=${state}; Max-Age=-1`);

    try {
      const body = new URLSearchParams();
      body.append("code", code);
      body.append("redirect_uri", REDIRECT_URI);
      body.append("grant_type", "authorization_code");

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",

        headers: {
          Authorization:
            "Basic " +
            Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        },
        body,
      });

      if (response.status) {
        const body = await response.json();
        const { access_token, refresh_token, expires_in } = body;

        res.setHeader("Set-Cookie", [
          `${ACCESS_TOKEN_KEY}=${access_token}; HttpOnly; Max-Age=${expires_in};path=/;`,
          `${REFRESH_TOKEN_KEY}=${refresh_token}; HttpOnly; Max-Age=${process.env.REFRESH_TOKEN_DURATION};path=/;`,
        ]);

        res.status(200).json({ isAuthenticated: true });
      }
    } catch (error) {
      res.redirect(
        "/#" +
          queryString.stringify({
            error: "invalid_token",
          })
      );
    }
  }
}
