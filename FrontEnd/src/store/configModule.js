export default {
  namespaced: true,

  state: {
    isLocalEnvironment: process.env.Remote === "Local",
  },

  getters: {
    isLocalEnvironment: (state) => state.isLocalEnvironment,
  },
};
