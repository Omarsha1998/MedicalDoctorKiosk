import axios from "axios";
import { Cookies } from "quasar";
import helper from "../helpers";

export default {
  async getServices({ commit }) {
    const response = await helper.endPointCallGet("services");
    commit("SET_SERVICES", response);
  },

  async getWellness({ commit }) {
    const response = await helper.endPointCallGet("wellness");
    commit("SET_WELLNESS", response);
  },

  async getDoctors({ commit }, data) {
    const response = await helper.endPointCallPost("doctors", data);
    commit("SET_DOCTORS", response.data);
  },

  // async getSpecialization({ commit }) {
  //   const response = await helper.endPointCallGet("getSpecialization");
  //   commit("SET_SPECIALIZATION", response);
  // },

  async getHmos({ commit }) {
    const response = await helper.endPointCallGet("hmos");
    commit("SET_HMOS", response);
  },

  async getImage({ commit }, doctorEhrCode) {
    // return await helper.endPointCallGetWithPathParam("picture", doctorEhrCode);
    return await helper.endPointCallGetParameter("picture", doctorEhrCode);
  },

  async selectedSpecialization({ commit }, specialty) {
    commit("SET_SELECTED_SPECIALTY", specialty);
  },

  async getDoctorsDepartment({ commit }) {
    const response = await helper.endPointCallGet("doctors-department");
    commit("SET_DOCTORS_DEPARTMENT", response);
  },

  async getDoctorHmo({ commit }, drCode) {
    const data = {
      drCode: drCode,
    };
    const response = await helper.endPointCallGetParameter("doctors-hmo", data);

    commit("SET_HMO_IMAGES", response);
  },

  async getSecretaryDoctors({ commit }, secretaryCode) {
    const token = Cookies.get("token");
    const data = {
      secretaryCode: secretaryCode,
    };

    const response = await helper.endPointCallGetParameter(
      "getSecretaryDoctors",
      data,
      token
    );
    commit("SET_SECRETARY_DOCTORS", response);
  },

  async checkDoctorAttendance({}, data) {
    const token = Cookies.get("token");
    const response = await helper.endPointCallGetParameter(
      "checkDoctorAttendance",
      data,
      token
    );
    return response;
  },

  async updateDoctorStatus({}, data) {
    const token = Cookies.get("token");
    await helper.endPointCallPost("updateDoctorStatus", data, token);
  },

  async getDoctorsStatusCount({ commit }, data) {
    const response = await helper.endPointCallPost("doctors", data);
    commit("SET_DOCTORS_COUNT", response.data);
  },

  async getAllSecretaryWithDoctors({ commit }) {
    const token = Cookies.get("token");
    const response = await helper.endPointCallGet(
      "getAllSecretaryWithDoctors",
      token
    );
    commit("SET_SECRETARYWITHDOCTORS", response);
  },

  async removeDoctorInSecretary({ commit }, data) {
    const token = Cookies.get("token");
    const response = await helper.endPointCallPost(
      "removeDoctorInSecretary",
      data,
      token
    );
  },

  async addDoctorAssignment({ commit }, data) {
    const token = Cookies.get("token");
    const response = await helper.endPointCallPost(
      "addDoctorAssignment",
      data,
      token
    );
  },

  async doctorContacts({}, doctorEhrCode) {
    const response = await helper.endPointCallGetWithPathParam(
      "doctorContacts",
      doctorEhrCode
    );

    return response;
  },

  async doctorSchedule({}, doctorEhrCode) {
    const response = await helper.endPointCallGetWithPathParam(
      "doctorSchedule",
      doctorEhrCode
    );

    return response;
  },

  async doctorEducation({}, doctorEhrCode) {
    const response = await helper.endPointCallGetWithPathParam(
      "doctorEducation",
      doctorEhrCode
    );

    return response;
  },

  async updateDoctor({}, data) {
    const token = Cookies.get("token");
    const response = await helper.endPointCallPost("updateDoctor", data, token);
    return response;
  },

  async consultationOption({}, data) {
    const response = await helper.endPointCallGet("consultationOption");
    return response;
  },

  async deptSpecOption({}, data) {
    const response = await helper.endPointCallGet("deptSpecOption");
    return response;
  },

  // async doctorSecretaries({}, doctorEhrCode) {
  //   const data = {
  //     doctorEhrCode: doctorEhrCode,
  //   };

  //   const response = await helper.endPointCallGetParameter(
  //     "doctorSecretaries",
  //     data
  //   );
  //   return response;
  // },

  async doctorSecretaries({}, doctorEhrCode) {
    const response = await helper.endPointCallGetWithPathParam(
      "doctorSecretaries",
      doctorEhrCode
    );

    return response;
  },
};
