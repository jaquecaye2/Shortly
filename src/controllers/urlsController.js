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
      "SELECT * FROM shortly_urls WHERE id=$1",
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
    const userAccess = user[0].userId;

    // verificar se a pessoa que está acessando a sessão é a dona da URL
    if (ownerUrl[0].id !== userAccess) {
      response.status(401).send("Solicitação não autorizada");
      return;
    }

    // deletar URL9
    await connection.query("DELETE FROM shortly_urls WHERE id = $1", [id]);

    response.status(204).send();
  } catch (error) {
    response.status(500).send();
  }
}

export async function showMyUrls(request, response) {
  try {
    const user = response.locals.user;

    // buscar o usuario respectivo ao token
    const { rows: userToken } = await connection.query(
      `SELECT *
      FROM sessions
      JOIN users ON users.id = sessions."userId"
      WHERE sessions."userId" = $1`,
      [user[0].userId]
    );

    if (userToken.length === 0){
      response.status(404).send("Usuário não encontrado. Tente novamente!")
      return
    }

    // buscar em shortly-urls as urls que estao cadastradas para o usuario
    const { rows: myUrls } = await connection.query(
      `SELECT sessions."userId" as id, users.name as name, sessions.id as sessionId, shortly_urls.id as shortId, "shortUrl", url, "visitCount"
      FROM shortly_urls
      JOIN sessions ON sessions.id = shortly_urls."sessionId"
      JOIN users ON users.id = sessions."userId"
      WHERE sessions."userId" = $1
      ORDER BY shortly_urls.id`,
      [user[0].userId]
    );

    // fazer a contagem de visitar que o usuario teve em todas as suas url
    const { rows: somaVisit } = await connection.query(
      `SELECT SUM("visitCount")
      FROM shortly_urls
      JOIN sessions ON sessions.id = shortly_urls."sessionId"
      JOIN users ON users.id = sessions."userId"
      WHERE users.id = $1`,
      [user[0].userId]
    );

    const myUrlsJoin = {
      ...myUrls[0],
      visitCount: parseInt(somaVisit[0].sum),
      shortenedUrls: myUrls.map(function (value) {
        return {
          id: value.shortid,
          shortUrl: value.shortUrl,
          url: value.url,
          visitCount: value.visitCount,
        };
      }),
    };

    delete myUrlsJoin.sessionid;
    delete myUrlsJoin.shortid;
    delete myUrlsJoin.shortUrl;
    delete myUrlsJoin.url;
    delete myUrlsJoin.visitCountUnic;

    response.status(200).send(myUrlsJoin);
  } catch (error) {
    response.status(500).send();
  }
}

export async function showRanking(request, response) {
  try {
    const { rows: users } = await connection.query(
      `SELECT users.id, users.name, COUNT("visitCount") AS "linksCount", SUM("visitCount") AS "visitCount"
      FROM shortly_urls
      JOIN sessions ON sessions.id = shortly_urls."sessionId"
      JOIN users ON users.id = sessions."userId"
      GROUP BY users.id
      ORDER BY "visitCount" DESC`
    );

    response.status(200).send(users);
  } catch (error) {
    response.status(500).send();
  }
}