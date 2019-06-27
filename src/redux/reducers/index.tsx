import { combineReducers } from 'redux';
import confirmPasscode from "./confirmPasscode";

const allReducers = combineReducers( {
    confirmPasscode
} );

export default allReducers;