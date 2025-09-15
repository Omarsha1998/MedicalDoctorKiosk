import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import helperMethods from "../helperMethods.js";
import Store from "../store/index.js";
import { Cookies } from "quasar";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    helperMethods.setPageTitle(to.meta.title + " | " + process.env.APP_NAME);
    let toFullPathLowerCase = to.fullPath.toLowerCase();

    const token = helperMethods.getCookie("token");

    if (token && Store.getters["userModule/hasValues"] === false) {
      await Store.dispatch("userModule/setNewValues", token);
    }

    // Check if the route requires authentication
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (Store.getters["userModule/hasValues"] === false || !token) {
        if (to.path === "/doctors") {
          return next();
        }
        if (to.path === "/doctor-attendance") {
          return next("/login");
        }
        if (to.path === "/admin-config") {
          return next("/login");
        }
        if (to.path === "/doctors-config") {
          return next("/login");
        }
        return next();
      }
      return next();
    }

    // Otherwise, proceed to the requested route
    return next();
  });

  return Router;
});
