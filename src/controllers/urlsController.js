import connection from "../dbStrategy/postgres.js";
import { nanoid } from "nanoid";

export async function transformUrl(request, response) {
  try {
    const user = response.locals.user;
    const { url } = request.body;

    const shortUrl = nanoid();

    await connection.query(
      `INSERT INTO shortly_urls ("sessionId", url, "shortUrl") VALUES ($1, $2, $3)`,
      [user[0].id, url, shortUrl]
    );

    response.status(201).send({"shortUrl": shortUrl});
  } catch (error) {
    response.status(500).send();
  }
}

export async function searchUrl(request, response) {}

export async function openUrl(request, response) {}

export async function deleteUrl(request, response) {}
