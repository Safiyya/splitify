// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ACCESS_TOKEN_KEY } from "../../../constants";

type Data = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const accessToken = req.cookies[ACCESS_TOKEN_KEY];

  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const user = await response.json();

  const { id: user_id } = user;
  const responseLikedTrackes = await fetch(
    `https://api.spotify.com/v1/me/tracks?limit=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const tracks = await responseLikedTrackes.json();

  const responsePlaylists = await fetch(
    `https://api.spotify.com/v1/users/${user_id}/playlists`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const playlists = await responsePlaylists.json();

  res.status(200).json({ user, playlists, tracks });
}
