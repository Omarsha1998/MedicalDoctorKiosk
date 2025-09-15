import { store } from "quasar/wrappers";
import { createStore } from "vuex";
import middleware from "./middleware.js";
import linkList from "./linkList";
import doctorsModule from "./doctorsModule";
import userModule from "./userModule";

// Create Vuex Store
const Store = createStore({
  modules: {
    doctorsModule,
    userModule,
    linkList,
  },
  plugins: [middleware],
});

// Vuex Subscriber - Automatically refresh doctors after status update
Store.subscribeAction({
  after: (action) => {
    if (action.type === "doctorsModule/updateDoctorStatus") {
      Store.dispatch("doctorsModule/getDoctors");
    }
  },
});

export default Store;
