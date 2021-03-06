import type { Web3ConnectPayload } from 'types';
import actionTypes from './actionTypes';

export const setWeb3ConnectAction = (payload: Web3ConnectPayload) => ({
  type: actionTypes.WEB3_CONNECT,
  payload,
});

export const setWeb3SuccessAction = (payload: Web3ConnectPayload) => ({
  type: actionTypes.WEB3_CONNECT_SUCCESS,
  payload,
});

export const setWeb3ErrorAction = () => ({
  type: actionTypes.WEB3_CONNECT_ERROR,
});

export const setWeb3ResetAction = () => ({
  type: actionTypes.WEB3_CONNECT_RESET,
});
