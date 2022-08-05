import connection from "../dbStrategy/postgres.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`,
      [user.name, user.email, encryptedPassword]
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
        `INSERT INTO sessions ("userId", token) VALUES ($1, $2)`,
        [findUser[0].id, token]
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
