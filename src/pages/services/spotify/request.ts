import { ACCESS_TOKEN_KEY } from "@/constants";
import { NextApiRequest } from "next";

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
      data: T;
      error: string | Error;
    }
> => {
  const accessToken = req.cookies[ACCESS_TOKEN_KEY];

  const response = await fetch(`https://api.spotify.com/v1${url}`, {
    method,
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log(url, response.status, response.headers.get("Retry-After"));
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
