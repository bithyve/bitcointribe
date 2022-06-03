import { Platform } from 'react-native'

export const historyArray = [
  {
    id: 1,
    title: 'Recovery Key created',
    date: null,
    info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
  },
  {
    id: 2,
    title: 'Recovery Key in-transit',
    date: null,
    info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
  },
  {
    id: 3,
    title: 'Recovery Key accessible',
    date: null,
    info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
  },
  {
    id: 4,
    title: 'Recovery Key not accessible',
    date: null,
    info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
  },
]

export const obj = {
  shareType: '',
  updatedAt: 0,
  status: 'notSetup',
  shareId: '',
  reshareVersion: 0,
  name: '',
  data: {
  },
  uuid: '',
}


export const LevelDataVar = [
  {
    levelName: 'Level 1',
    status: 'notSetup',
    // keeper1ButtonText: 'Set Password',
    keeper1ButtonText: 'Write down seed-words',
    keeper2ButtonText: Platform.OS == 'ios' ? 'Backup on iCloud' : 'Backup on Google Drive',
    keeper1: obj,
    keeper2: obj,
    note:'Manage Level 1 backup/ recovery keys',
    info:'Automated Cloud Backup',
    id: 1,
  },
  {
    levelName: 'Level 2',
    status: 'notSetup',
    keeper1ButtonText: 'Share Recovery Key 1',
    keeper2ButtonText: 'Share Recovery Key 2',
    keeper1: obj,
    keeper2: obj,
    note:'Manage Level 2 backup/ recovery keys',
    info:'Double Backup',
    id: 2,
  },
  {
    levelName: 'Level 3',
    status: 'notSetup',
    keeper1ButtonText: 'Share Recovery Key 1',
    keeper2ButtonText: 'Share Recovery Key 2',
    keeper1: obj,
    keeper2: obj,
    note:'Manage Level 3 backup/ recovery keys',
    info:'Multi-Key Backup',
    id: 3,
  },
]
