import { createStore } from 'redux';

const initialState = {
  isReady: false,
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
      isReady: false,
      strokes: state.strokes + 1,
      miss: state.miss + 1,
      missPosition: action.position,
      missRotation: action.rotation,
    };
  case 'HIT':
    return {
      ...state,
      isReady: false,
      strokes: state.strokes + 1,
      hit: state.hit + 1,
    };
  case 'READY':
    return {
      ...state,
      isReady: true,
    };
  default:
    return state;
  }
};

export default createStore(reduce, initialState);
