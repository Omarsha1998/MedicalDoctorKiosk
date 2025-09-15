export default {
  getToken: (state) => state.token,
  getSecretaryCode: (state) => state.secretaryCode,
  getSecretaryName: (state) => state.secretaryName,
  doctorConfig: (state) => state.accessRights.doctorConfig,
  secConfig: (state) => state.accessRights.secConfig,
  hmoUpdate: (state) => state.accessRights.hmo,
  contactUpdate: (state) => state.accessRights.contact,
  schedUpdate: (state) => state.accessRights.schedule,
  informationUpdate: (state) => state.accessRights.information,
  hasValues: (state) => {
    if (
      state.token !== null &&
      state.secretaryCode !== null &&
      state.secretaryName !== null
    ) {
      return true;
    }
    return false;
  },
};
