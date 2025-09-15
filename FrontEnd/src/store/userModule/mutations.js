export default {
  SET_LOGIN_DATA(state, data) {
    state.token = data.token || null;
    state.secretaryCode = data.employeeId || null;
    state.secretaryName = data.employeeFullName || null;
    state.accessRights.doctorConfig = data.accessRights?.doctorConfig || false;
    state.accessRights.secConfig = data.accessRights?.secConfig || false;
    state.accessRights.information = data.accessRights?.information || false;
    state.accessRights.contact = data.accessRights?.contact || false;
    state.accessRights.schedule = data.accessRights?.schedule || false;
    state.accessRights.hmo = data.accessRights?.hmo || false;
  },

  SET_LOGIN_DATA_DEFAULT(state) {
    state.token = null;
    state.secretaryCode = null;
    state.secretaryName = null;
  },
};
