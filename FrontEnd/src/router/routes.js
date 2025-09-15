const routes = [
  {
    path: "/",
    redirect: "/doctors",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      // {
      //   path: "/home-page",
      //   name: "Home Page",
      //   meta: {
      //     title: "Home",
      //     requiresAuth: true,
      //   },
      //   component: () => import("src/pages/LandingPage.vue"),
      // },
      {
        path: "/doctors",
        name: "Doctors",
        meta: {
          title: "Doctors",
          requiresAuth: true,
        },
        component: () => import("src/pages/DoctorGrid.vue"),
      },
      // {
      //   path: "/doctors",
      //   name: "Doctors",
      //   meta: {
      //     title: "Doctors",
      //     requiresAuth: true,
      //   },
      //   component: () => import("src/pages/Doctors.vue"),
      // },
      {
        path: "/diagnosticcenter",
        name: "Diagnostic Center",
        meta: {
          title: "Diagnostic Center",
          requiresAuth: true,
        },
        component: () => import("src/pages/DiagnosticCenter.vue"),
      },
      {
        path: "/wellnesscenter",
        name: "Wellness Center",
        meta: {
          title: "Wellness Center",
          requiresAuth: true,
        },
        component: () => import("src/pages/WellnessCenter.vue"),
      },
      // {
      //   path: "/doctorsCard",
      //   name: "Doctors Card",
      //   meta: {
      //     title: "DoctorsCard",
      //     requiresAuth: true,
      //   },
      //   component: () => import("src/pages/Doctors.vue"),
      // },
    ],
  },

  {
    path: "/doctor-attendance",
    redirect: "doctor-attendance",
    component: () => import("src/layouts/SecretaryLayout.vue"),
    children: [
      {
        path: "/doctor-attendance",
        name: "Doctor Attendance",
        meta: {
          title: "Doctors' Attendance",
          requiresAuth: true,
        },
        component: () => import("src/pages/DoctorAttendance.vue"),
      },

      {
        path: "/admin-config",
        name: "Doctor Secretary Config",
        meta: {
          title: "Doctor Secretary Config",
          requiresAuth: true,
        },
        component: () => import("src/pages/AdminPage.vue"),
      },

      {
        path: "/doctors-config",
        name: "Doctors Config",
        meta: {
          title: "Doctors Config",
          requiresAuth: true,
        },
        component: () => import("src/pages/DoctorConfig.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    meta: {
      title: "Login",
    },
    component: () => import("src/pages/Login.vue"),
  },
];

export default routes;
