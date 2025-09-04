export default {
  SET_SERVICES(state, services) {
    state.services = services;
  },

  SET_WELLNESS(state, wellness) {
    state.wellness = wellness;
  },

  SET_DOCTORS(state, doctors) {
    // state.doctors = doctors;

    // state.doctorsIn =
    //   state.doctors.length > 0
    //     ? state.doctors.filter((doctor) => doctor.isOnDuty === 1).length
    //     : 0;

    state.doctorsIn =
      doctors.length > 0
        ? doctors.filter((doctor) => doctor.isOnDuty === 1).length
        : 0;

    const formatDate = (isoDate) => {
      if (!isoDate) return null;
      const date = new Date(isoDate);
      return (
        (date.getMonth() + 1).toString().padStart(2, "0") +
        "/" +
        date.getDate().toString().padStart(2, "0") +
        "/" +
        date.getFullYear()
      );
    };

    const mappedDoctor = doctors.map((doctor) => ({
      ...doctor,
      philHealthExpirationDate: formatDate(doctor.philHealthExpirationDate),
      licenseExpirationDate: formatDate(doctor.licenseExpirationDate),
    }));

    state.doctors = mappedDoctor;
  },

  SET_DOCTORS_COUNT(state, doctors) {
    state.doctorCounts = doctors;
  },

  // SET_SPECIALIZATION(state, specialization) {
  //   state.specialization = specialization;
  // },

  SET_HMOS(state, hmo) {
    state.hmo = hmo;
  },

  SET_SELECTED_SPECIALTY(state, specialty) {
    state.selectedSpecialty = specialty;
  },

  SET_DOCTORS_DEPARTMENT(state, department) {
    const sortedDepartment = department.sort((a, b) =>
      a.label.localeCompare(b.label)
    );
    state.departments = sortedDepartment;
  },

  SET_HMO_IMAGES(state, hmoImage) {
    state.hmoImage = hmoImage;
  },

  SET_SECRETARY_DOCTORS(state, secretaryDoctors) {
    state.secretaryDoctors = Array.isArray(secretaryDoctors)
      ? secretaryDoctors
      : [];
  },

  SET_SECRETARYWITHDOCTORS(state, secretaryWithDoctors) {
    const groupedSecretaries = secretaryWithDoctors.reduce((acc, sec) => {
      let existingSecretary = acc.find(
        (s) => s.secretaryCode === sec.secretaryCode
      );

      if (existingSecretary) {
        if (sec.doctorCode && sec.doctorName) {
          existingSecretary.doctorsAssignment.push({
            id: sec.id,
            doctorCode: sec.doctorCode,
            doctorName: sec.doctorName,
          });
        }
      } else {
        acc.push({
          secretaryCode: sec.secretaryCode,
          secretaryName: sec.secretaryName,
          doctorsAssignment:
            sec.doctorCode && sec.doctorName
              ? [
                  {
                    id: sec.id,
                    doctorCode: sec.doctorCode,
                    doctorName: sec.doctorName,
                  },
                ]
              : [],
        });
      }
      return acc;
    }, []);

    state.secretaryWithDoctors = groupedSecretaries;
  },
};
