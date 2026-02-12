const campuses = [
  { code: "0", name: "UE Manila" },
  { code: "1", name: "UE Caloocan" },
];

const affiliations = [
  { code: "EMP", name: "Employee" },
  { code: "STU", name: "Student" },
];

module.exports = {
  campusesMap: campuses.reduce((a, e) => {
    a[e.code] = e;
    return a;
  }, {}),
  affiliationsMap: affiliations.reduce((a, e) => {
    a[e.code] = e;
    return a;
  }, {}),
};
