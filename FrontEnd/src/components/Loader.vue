<template>
  <div v-if="isLoading" class="loader-container">
    <div class="loader">{{ loaderText }}</div>
  </div>
</template>

<script>
export default {
  name: "Loader",
  props: {
    isLoading: {
      type: Boolean,
      default: true,
    },
    login: Boolean,
    logout: Boolean,
  },
  computed: {
    loaderText() {
      if (this.login) {
        return "Logging In...";
      } else if (this.logout) {
        return "Logging Out...";
      } else {
        return "Loading...";
      }
    },
  },
};
</script>
