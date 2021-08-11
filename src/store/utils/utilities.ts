import { take, fork } from 'redux-saga/effects'

export const createWatcher = ( worker, type ) => {
  return function* () {
    while ( true ) {
      const action = yield take( type )
      yield fork( worker, action )
    }
  }
}

export const requestTimedout = () => {
  console.log(
    'Request Timeout!',
    'Unable to get a response from server. Please, try again shortly',
  )
}
