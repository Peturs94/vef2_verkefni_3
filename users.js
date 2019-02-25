const { Client } = require('pg');
const bcrypt = require('bcrypt');

const sessionSecret = process.env.SESSION_SECRET;
const connectionString = process.env.DATABASE_URL;

async function query(q, values = []) {
  const client = new Client({ connectionString });

  await client.connect();

  try {
    const result = await client.query(q, values);

    return result;
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
}

async function insert(data) {
  const hashedPassword = await bcrypt.hash(data.password, sessionSecret);
  const q = `
  INSERT INTO applications
  (username, password, name, email, admin)
  VALUES
  ($1, $2, $3, $4, $5)`;
  const values = [data.username, hashedPassword, data.name, data.email, data.job];

  return query(q, values);
}

async function select() {
  const result = await query('SELECT * FROM applications ORDER BY id');

  return result.rows;
}

async function update(id) {
  const q = `
UPDATE applications
SET processed = true, updated = current_timestamp
WHERE id = $1`;

  return query(q, id);
}

async function deleteRow(id) {
  const q = 'DELETE FROM applications WHERE id = $1';

  return query(q, id);
}

async function findUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';
  const result = await query(q, [username]);
  if (result.rows.length > 0) {
    const found = result.rows[0];
    return Promise.resolve(found);
  }
  return Promise.resolve(null);
}

async function comparePw(password, user) {
  const ok = await bcrypt.compare(password, user.password);

  if (ok) {
    return user;
  }
  return false;
}

async function findId(id) {
  const q = 'SELECT * FROM users WHERE id = $1';
  const result = await query(q, [id]);

  if (result.rows.length > 0) {
    const found = result.rows[0];
    return Promise.resolve(found);
  }
  return Promise.resolve(null);
}

async function setAdminFalse() {
  const q = `UPDATE users SET admin = false WHERE admin = true`;  // eslint-disable-line
  const done = await query(q); // eslint-disable-line
}

async function setAdmin(usernames) {
  const q = 'UPDATE users SET admin = true WHERE username = $1';
  for (let i=0; i<usernames.length; i++) {// eslint-disable-line
    console.log('Notandi er admin: ' + usernames[i]);// eslint-disable-line
    const result = await query(q, [usernames[i]]); // eslint-disable-line
  }
}

module.exports = {
  query,
  insert,
  select,
  update,
  deleteRow, // delete er frátekið orð
  comparePw,
  findUsername,
  findId,
  setAdmin,
  setAdminFalse,
};
