import connection from "../dbStrategy/postgres.js";
import bcrypt from "bcrypt";
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

    const encryptedPassword = bcrypt.hashSync(user.password, 10)

    await connection.query(`INSERT INTO users (name, email, password) VALUES ('${user.name}', '${user.email}', '${encryptedPassword}');`)

    response.status(201).send();
  } catch (error) {
    response.status(500).send();
  }
}

export async function signIn(request, response) {}

export async function teste(request, response) {
  const users = await connection.query("SELECT * FROM users");
  response.send(users.rows);
}
