import * as database from './database';

const initialize = () => database.init();
const fetch = () => database.fetch();
const insert = (encData: string) => database.insert(encData);
const update = (encData: string) => database.update(encData);

export default {
  initialize,
  fetch,
  insert,
  update,
};
