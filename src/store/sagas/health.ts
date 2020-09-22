import { call, put, select, delay } from 'redux-saga/effects';
import {
  createWatcher,
  serviceGenerator,
  requestTimedout,
} from '../utils/utilities';
import {
  INIT_HEALTH_SETUP,
} from '../actions/health';
import S3Service from '../../bitcoin/services/sss/S3Service';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import {
  SECURE_ACCOUNT,
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../common/constants/serviceTypes';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import {
  updateHealth,
} from '../actions/health';

function* initHealthData() {
  let healthArray = [];
  for (let i = 0; i < 3; i++) {
    let subObj1 = {
      keeperType: null,
      type: 'cloud',
      lastUpdated: null,
      created: null,
      status: 'notAccessible',
      shareId: null,
    };
    let subObj2 = {
      keeperType: 'otherKeeper',
      type: null,
      lastUpdated: null,
      created: null,
      status: 'notAccessible',
      shareId: null,
    };
    let obj = {
      level: 1,
      levelStatus: 'notSetup',
      levelInfo: [ subObj1, subObj2 ],
    };
    
    if(i == 0){
      obj.level = 1;
      obj.levelInfo = [ subObj1,
        {
          keeperType: null,
          type: 'securityQuestion',
          lastUpdated: moment(new Date()).valueOf(),
          created: moment(new Date()).valueOf(),
          status: 'accessible',
          shareId: null,
        },
      ];
    }
    if(i == 1){
      obj.level = 2;
      obj.levelInfo = [ {...subObj1, keeperType: 'primaryKeeper',
        type: 'device', }, 
        subObj2
      ];
    }
    if(i == 2){
      obj.level = 3;
      obj.levelInfo = [ subObj2, subObj2 ];
    }
    healthArray.push(obj);
  }
  yield put(updateHealth(healthArray));
}

export const initHealthDataWatcher = createWatcher(
  initHealthData,
  INIT_HEALTH_SETUP,
);