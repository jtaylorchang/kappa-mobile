import { TUser, initialUser } from '@backend/auth';

export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';

export const LOADED_USER = 'LOADED_USER';
export const SET_USER = 'SET_USER';
export const MODIFY_USER = 'MODIFY_USER';

export const SIGN_IN = 'SIGN_IN';
export const SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS';
export const SIGN_IN_FAILURE = 'SIGN_IN_FAILURE';
export const SIGN_OUT = 'SIGN_OUT';

export const SIGN_IN_WITH_GOOGLE = 'SIGN_IN_WITH_GOOGLE';
export const SIGN_IN_WITH_GOOGLE_SUCCESS = 'SIGN_IN_WITH_GOOGLE_SUCCESS';
export const SIGN_IN_WITH_GOOGLE_FAILURE = 'SIGN_IN_WITH_GOOGLE_FAILURE';

export const SHOW_SIGN_IN = 'SHOW_SIGN_IN';

export interface TAuthState {
  visible: boolean;

  isSigningInWithGoogle: boolean;
  authorizedGoogle: boolean;
  signInWithGoogleError: boolean;
  signInWithGoogleErrorMessage: string;

  isAuthenticating: boolean;
  loadedUser: boolean;
  user: TUser;
  authorized: boolean;
  signInError: boolean;
  signInErrorMessage: string;

  signInVisible: boolean;
}

const initialState: TAuthState = {
  visible: false,

  isSigningInWithGoogle: false,
  authorizedGoogle: false,
  signInWithGoogleError: false,
  signInWithGoogleErrorMessage: '',

  isAuthenticating: false,
  loadedUser: false,
  user: initialUser,
  authorized: false,
  signInError: false,
  signInErrorMessage: '',

  signInVisible: true
};

export default (state = initialState, action: any): TAuthState => {
  switch (action.type) {
    case SHOW_MODAL:
      return {
        ...state,
        visible: true
      };
    case HIDE_MODAL:
      return {
        ...state,
        visible: false
      };
    case SHOW_SIGN_IN:
      return {
        ...state,
        signInVisible: true,
        signInError: false,
        signInErrorMessage: ''
      };
    case LOADED_USER:
      return {
        ...state,
        loadedUser: true
      };
    case SET_USER:
      return {
        ...state,
        user: action.user,
        authorized: action.authorized
      };
    case MODIFY_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.user
        }
      };
    case SIGN_IN:
      return {
        ...state,
        isAuthenticating: true,
        signInError: false,
        signInErrorMessage: ''
      };
    case SIGN_IN_SUCCESS:
      return {
        ...state,
        isAuthenticating: false,
        authorized: true
      };
    case SIGN_IN_FAILURE:
      return {
        ...state,
        isAuthenticating: false,
        signInError: true,
        signInErrorMessage: action.error.message,
        authorized: false,
        authorizedGoogle: false,
        user: initialUser
      };
    case SIGN_IN_WITH_GOOGLE:
      return {
        ...state,
        isSigningInWithGoogle: true,
        signInWithGoogleError: false,
        signInWithGoogleErrorMessage: ''
      };
    case SIGN_IN_WITH_GOOGLE_SUCCESS:
      return {
        ...state,
        isSigningInWithGoogle: false,
        authorizedGoogle: true
      };
    case SIGN_IN_WITH_GOOGLE_FAILURE:
      return {
        ...state,
        isSigningInWithGoogle: false,
        signInWithGoogleError: true,
        signInWithGoogleErrorMessage: action.error.message
      };
    case SIGN_OUT:
      return {
        ...state,
        authorized: false,
        user: initialUser,
        authorizedGoogle: false
      };
    default:
      return state;
  }
};
