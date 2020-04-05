import { Kappa } from '@backend';
import {
  GET_EVENTS,
  GET_EVENTS_SUCCESS,
  GET_EVENTS_FAILURE,
  SELECT_EVENT,
  UNSELECT_EVENT,
  GET_ATTENDANCE,
  GET_ATTENDANCE_SUCCESS,
  GET_ATTENDANCE_FAILURE,
  GET_DIRECTORY,
  GET_DIRECTORY_SUCCESS,
  GET_DIRECTORY_FAILURE,
  SELECT_USER,
  UNSELECT_USER
} from '@reducers/kappa';
import { TUser } from '@backend/auth';

const gettingEvents = () => {
  return {
    type: GET_EVENTS
  };
};

const getEventsSuccess = data => {
  return {
    type: GET_EVENTS_SUCCESS,
    events: data.events
  };
};

const getEventsFailure = err => {
  return {
    type: GET_EVENTS_FAILURE,
    error: err
  };
};

export const getEvents = (user: TUser) => {
  return dispatch => {
    dispatch(gettingEvents());

    Kappa.getEvents({ user }).then(res => {
      if (res.success) {
        dispatch(getEventsSuccess(res.data));
      } else {
        dispatch(getEventsFailure(res.error));
      }
    });
  };
};

const gettingDirectory = () => {
  return {
    type: GET_DIRECTORY
  };
};

const getDirectorySuccess = data => {
  return {
    type: GET_DIRECTORY_SUCCESS,
    users: data.users
  };
};

const getDirectoryFailure = err => {
  return {
    type: GET_DIRECTORY_FAILURE,
    error: err
  };
};

export const getDirectory = (user: TUser) => {
  return dispatch => {
    dispatch(gettingDirectory());

    Kappa.getUsers({ user }).then(res => {
      if (res.success) {
        dispatch(getDirectorySuccess(res.data));
      } else {
        dispatch(getDirectoryFailure(res.error));
      }
    });
  };
};

const gettingAttendance = () => {
  return {
    type: GET_ATTENDANCE
  };
};

const getAttendanceSuccess = data => {
  return {
    type: GET_ATTENDANCE_SUCCESS,
    attended: data.attended,
    excused: data.excused
  };
};

const getAttendanceFailure = err => {
  return {
    type: GET_ATTENDANCE_FAILURE,
    error: err
  };
};

export const getMyAttendance = (user: TUser) => {
  return getUserAttendance(user, user.email);
};

export const getUserAttendance = (user: TUser, target: string) => {
  return dispatch => {
    dispatch(gettingAttendance());

    Kappa.getAttendanceByUser({ user, target }).then(res => {
      if (res.success) {
        dispatch(getAttendanceSuccess(res.data));
      } else {
        dispatch(getAttendanceFailure(res.error));
      }
    });
  };
};

export const getEventAttendance = (user: TUser, target: string) => {
  return dispatch => {
    dispatch(gettingAttendance());

    Kappa.getAttendanceByEvent({ user, target }).then(res => {
      if (res.success) {
        dispatch(getAttendanceSuccess(res.data));
      } else {
        dispatch(getAttendanceFailure(res.error));
      }
    });
  };
};

export const selectEvent = (event_id: string) => {
  return {
    type: SELECT_EVENT,
    event_id
  };
};

export const unselectEvent = () => {
  return {
    type: UNSELECT_EVENT
  };
};

export const selectUser = (email: string) => {
  return {
    type: SELECT_USER,
    email
  };
};

export const unselectUser = () => {
  return {
    type: UNSELECT_USER
  };
};
