// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../../constants";

type Data = {};

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // requesting access token from refresh token
  var refresh_token = req.cookies[REFRESH_TOKEN_KEY];

  if (
    refresh_token === null ||
    !refresh_token ||
    Array.isArray(refresh_token)
  ) {
    res.redirect("/api/auth/login");
    return;
  }

  const body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", refresh_token);
  body.append("grant_type", "authorization_code");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
      body,
    });

    if (response.status === 200) {
      const body = await response.json();
      var { access_token, expires_in } = body;

      res.setHeader("Set-Cookie", [
        `${ACCESS_TOKEN_KEY}=${access_token}; HttpOnly; Max-Age=${expires_in}; page=/;`,
        `${REFRESH_TOKEN_KEY}=${refresh_token}; HttpOnly; Max-Age=${
          60000 * 15
        }; page=/;`,
      ]);
      res.status(200).json({ access_token, refresh_token });
    } else {
      res.status(response.status).json({});
    }
  } catch (error) {
    res.status(500).json({ error });
  }
}
