import * as db from './database';
import { encrypt, decrypt } from '../common/encryption';

const initialize = () => db.init();

const fetch = async key => {
  try {
    const data = await db.fetch();
    if (data.rows._array.length === 0) {
      return;
    }
    const encryptedDatabase = data.rows._array[0].encData;
    const database = decrypt(encryptedDatabase, key);

    return database;
  } catch (err) {
    console.log(err);
  }
};

const insert = async (database, key, inserted = true) => {
  const encryptedDatabase = encrypt(database, key);

  try {
    inserted
      ? await db.update(encryptedDatabase)
      : await db.insert(encryptedDatabase);
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

const insertSSS = async (database, key, inserted = true) => {
  const encryptedDatabase = encrypt(database, key);
  try {
    inserted
      ? await db.updateSSS(encryptedDatabase)
      : await db.insertSSS(encryptedDatabase);
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

export default {
  initialize,
  fetch,
  insert,
  insertSSS,
};
