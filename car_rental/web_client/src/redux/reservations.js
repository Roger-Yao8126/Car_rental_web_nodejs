import _ from 'lodash';

// Constants
const RESERVATIONS_SELECTED = 'reservations/selected';

// Actions
export const selectReservation = reservation => {
  return {
    type: RESERVATIONS_SELECTED,
    result:  reservation
  };
};

// Initial State
const INITIAL_STATE = {
  reservation: null, 
};

// Reducer
export default function reducer(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case RESERVATIONS_SELECTED: {
      return _.assign({}, state, {
        reservation: action.result
      });
    }
    default:
      return state;
  }
}
