export default {
  getServices: (state) => state.services,
  getWellness: (state) => state.wellness,
  getDoctors: (state) => state.doctors,
  getSpecialization: (state) => state.specialization,
  getHmos: (state) => state.hmo,
  getSelectedSpecialty: (state) => state.selectedSpecialty,
  getDepartments: (state) => state.departments,
  getHmoImage: (state) => state.hmoImage,
  getSecretaryDoctors: (state) => state.secretaryDoctors,
  getDoctorsIn: (state) => state.doctorsIn,
  getDoctorsCounts: (state) => state.doctorCounts,
  getSecretaryWithDoctors: (state) => state.secretaryWithDoctors,
};
