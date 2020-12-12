import { combineReducers } from 'redux';
import reservations from './reservations';

const mainReducer = combineReducers({
  reservations
});

export default mainReducer;