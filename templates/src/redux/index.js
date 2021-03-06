import { createStore, compose, combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { devToolsEnhancer } from 'redux-devtools-extension';
import keys from './keys';

import reducerRegistry from './reducer-registry';

import preloaderReducer from './modules/preloader';
import { isNode } from '../config';

import { windowSizeReducer, previousRouteReducer, layoutReducer } from './modules/app';

let store;
const initialState = {};
const enhancers = [];

const defaultReducers = {
  preloader: preloaderReducer,
  windowSize: windowSizeReducer,
  previousRoute: previousRouteReducer,
  layout: layoutReducer,
  routing: routerReducer
};

// Reducers
const enableBatchActions = reducers => {
  return function(state, action) {
    switch (action.type) {
      case keys.BATCH_ACTIONS:
        return action.actions.reduce(reducers, state);
      default:
        return reducers(state, action);
    }
  };
};

const combine = reducers => {
  const reducerNames = Object.keys(reducers);
  Object.keys(initialState).forEach(item => {
    if (reducerNames.indexOf(item) === -1) {
      reducers[item] = (state = null) => state;
    }
  });
  return enableBatchActions(combineReducers(reducers));
};

function createInitialReducer() {
  reducerRegistry.reducers = defaultReducers;
  return combine(defaultReducers);
}

reducerRegistry.setChangeListener(reducers => {
  store.replaceReducer(combine(reducers));
});

// Enhancers
if (!isNode && process.env.NODE_ENV !== 'production') {
  enhancers.push(devToolsEnhancer());
}

const composedEnhancers = compose(...enhancers);

// Configure Store
function configureStore() {
  store = createStore(createInitialReducer(), initialState, composedEnhancers);
  return store;
}

export default configureStore();
