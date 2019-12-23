import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('hexa.db');

export const init = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS base (id INTEGER PRIMARY KEY NOT NULL, encData TEXT NOT NULL);',
        [],
        () => {
          resolve();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS sss (id INTEGER PRIMARY KEY NOT NULL, encData TEXT NOT NULL);',
        [],
        () => {
          resolve();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
};

export const fetch = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM base;',
        [],
        (_, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
};

export const fetchSSS = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM sss;',
        [],
        (_, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
};

export const insert = encData => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO base (encData) VALUES (?);',
        [encData],
        (_, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
};

export const insertSSS = encData => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO sss (encData) VALUES (?);',
        [encData],
        (_, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
};

export const update = encData => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE base SET encData=? WHERE id=1`,
        [encData],
        (_, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
};

export const updateSSS = encData => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE sss SET encData=? WHERE id=1`,
        [encData],
        (_, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
};
