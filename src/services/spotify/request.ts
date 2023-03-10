import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export type ServiceErrorCodes =
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 428
  | 429
  | 500;

const request = async <T>(
  req: NextApiRequest,
  res: NextApiResponse,
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: BodyInit
): Promise<
  | {
      status: 200;
      data: T;
    }
  | {
      status: ServiceErrorCodes;
      data: T | null;
      error: string | Error;
    }
> => {
  const session = await getSession({ req });

  if (!session) {
    console.log("No session available");
    return {
      status: 401,
      data: null,
      error: "No session available",
    };
  }

  const { accessToken } = session;
  const response = await fetch(`https://api.spotify.com/v1${url}`, {
    method,
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log(url.slice(0, 60), response.status, response.statusText);
  const data = (await response.json()) as T;

  if (response.status !== 200) {
    return {
      status: response.status as ServiceErrorCodes,
      data,
      error: response.statusText,
    };
  }

  return {
    status: 200,
    data,
  };
};

export default request;
