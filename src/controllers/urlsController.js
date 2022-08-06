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

    response.status(201).send({ shortUrl: shortUrl });
  } catch (error) {
    response.status(500).send();
  }
}

export async function searchUrl(request, response) {
  try {
    const { id } = request.params;

    const { rows: urlId } = await connection.query(
      'SELECT id, "shortUrl", url FROM shortly_urls WHERE id=$1',
      [id]
    );

    if (urlId.length === 0) {
      response.status(404).send("URL não encontrada. Tente novamente!");
      return;
    }

    response.status(200).send(urlId[0]);
  } catch (error) {
    response.status(500).send();
  }
}

export async function openUrl(request, response) {
  try {
    const { shortUrl } = request.params;

    const { rows: url } = await connection.query(
      'SELECT url, "visitCount" FROM shortly_urls WHERE "shortUrl"=$1',
      [shortUrl]
    );

    if (url.length === 0) {
      response.status(404).send("URL não encontrada. Tente novamente!");
      return;
    }

    await connection.query(
      `UPDATE shortly_urls SET "visitCount" = '${
        url[0].visitCount + 1
      }' WHERE "shortUrl"=$1`,
      [shortUrl]
    );

    response.redirect(url[0].url);
  } catch (error) {
    response.status(500).send();
  }
}

export async function deleteUrl(request, response) {
  try {
    const user = response.locals.user;

    const { id } = request.params;

    // verificar se o id passado corresponde a alguma URL
    const { rows: urlId } = await connection.query(
      'SELECT * FROM shortly_urls WHERE id=$1',
      [id]
    );

    if (urlId.length === 0) {
      response.status(404).send("URL não encontrada. Tente novamente!");
      return;
    }

    // verificar quem é o dono da URL que ele quer deletar atraves do id
    const { rows: ownerUrl } = await connection.query(
      `SELECT users.id 
        FROM shortly_urls
        JOIN sessions ON "sessions".id = shortly_urls."sessionId"
        JOIN users ON users.id = sessions."userId"
        WHERE shortly_urls.id = $1`,
      [id]
    );

    // verificar quem é a pessoa que esta acessando a sessão
    const userAccess = user[0].userId


    // verificar se a pessoa que está acessando a sessão é a dona da URL
    if (ownerUrl[0].id !== userAccess){
      response.status(401).send("Solicitação não autorizada");
      return
    }

    // deletar URL9
    await connection.query("DELETE FROM shortly_urls WHERE id = $1", [id])

    response.status(204).send();
  } catch (error) {
    response.status(500).send();
  }
}
