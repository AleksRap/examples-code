import { put, takeLatest } from 'redux-saga/effects';
import { MetamaskStatus, routes } from 'appConstants';
import { history } from 'utils';
import { Web3ConnectAction as Action } from 'types';
import { setWeb3ErrorAction, setWeb3SuccessAction } from '../actions';
import actionTypes from '../actionTypes';

function* setWeb3Connect({ payload }: Action) {
  try {
    const { address, status } = payload;

    if (status === MetamaskStatus.AVAILABLE) {
      yield put(setWeb3SuccessAction({
        status: address ? MetamaskStatus.CONNECTED : MetamaskStatus.AVAILABLE,
        address,
      }));

      if (address) {
        history.push({ pathname: routes.auth.signin.root });
      }
    }
  } catch (err) {
    yield put(setWeb3ErrorAction());
  }
}

export default function* listener() {
  yield takeLatest(actionTypes.WEB3_CONNECT, setWeb3Connect);
}
