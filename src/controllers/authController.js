import connection from "../dbStrategy/postgres.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import joi from "joi";

export async function signUp(request, response) {
  try {
    const user = request.body;

    const { rows: alreadyUsed } = await connection.query(
      "SELECT * FROM users WHERE email = $1",
      [user.email]
    );

    if (alreadyUsed.length !== 0) {
      response.status(409).send("E-mail já está sendo utilizado!");
      return;
    }

    const encryptedPassword = bcrypt.hashSync(user.password, 10);

    await connection.query(
      `INSERT INTO users (name, email, password) VALUES ('${user.name}', '${user.email}', '${encryptedPassword}');`
    );

    response.status(201).send();
  } catch (error) {
    response.status(500).send();
  }
}

export async function signIn(request, response) {
  try {
    const user = request.body;

    const { rows: findUser } = await connection.query(
      "SELECT * FROM users WHERE email=$1",
      [user.email]
    );

    if (findUser.length === 0) {
      response.status(401).send("Usuário não cadastrado!");
      return;
    }

    if (bcrypt.compareSync(user.password, findUser[0].password)) {
      const token = jwt.sign({ email: findUser[0].email }, "Gerando token");

      await connection.query(
        `INSERT INTO sessions ("userId", token) VALUES ('${findUser[0].id}', '${token}');`
      );

      response.status(200).send(token);
      return;
    } else {
      response.status(401).send("E-mail e/ou senha inválidos!");
      return;
    }
  } catch (error) {
    response.status(500).send();
  }
}

export async function teste(request, response) {
  const users = await connection.query("SELECT * FROM users");
  response.send(users.rows);
}

export async function teste2(request, response) {
  const sessions = await connection.query("SELECT * FROM sessions");
  response.send(sessions.rows);
}
