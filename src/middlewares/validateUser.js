import connection from "../dbStrategy/postgres.js";

async function validateUser(request, response, next) {
  const { authorization } = request.headers;
  const token = authorization?.replace("Bearer ", "");

  const {rows: user} = await connection.query("SELECT * FROM sessions WHERE token = $1", [token])

  if (user.length === 0){
    response.status(401).send("Usuário não está logado. Tente novamente!")
    return
  }

  response.locals.user = user;

  next()
}

export default validateUser;
