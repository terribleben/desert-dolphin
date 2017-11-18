import { createStore } from 'redux';

const initialState = {
  strokes: 0,
  miss: 0,
  hit: 0,
  missPosition: null,
  missRotation: null,
};

const reduce = (state, action) => {
  switch (action.type) {
  case 'MISS':
    return {
      ...state,
      strokes: state.strokes + 1,
      miss: state.miss + 1,
      missPosition: action.position,
      missRotation: action.rotation,
    };
  case 'HIT':
    return {
      ...state,
      strokes: state.strokes + 1,
      hit: state.hit + 1,
    };
  default:
    return state;
  }
};

export default createStore(reduce, initialState);
