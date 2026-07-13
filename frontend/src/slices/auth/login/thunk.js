import { postLogin } from "../../../helpers/backend_helper";
import { setAuthorization } from "../../../helpers/api_helper";

import { loginSuccess, logoutUserSuccess, apiError, reset_login_flag } from './reducer';

export const loginUser = (user, navigate) => async (dispatch) => {
  try {
    const response = await postLogin({
      email: user.email,
      password: user.password,
    });

    sessionStorage.setItem("authUser", JSON.stringify(response));
    setAuthorization(response.token);
    dispatch(loginSuccess(response));
    navigate('/dashboard');
  } catch (error) {
    const message = typeof error === "string" ? error : (error?.message || "Login failed");
    dispatch(apiError(message));
  }
};

export const logoutUser = () => async (dispatch) => {
  sessionStorage.removeItem("authUser");
  dispatch(logoutUserSuccess(true));
};

export const resetLoginFlag = () => async (dispatch) => {
  dispatch(reset_login_flag());
};
