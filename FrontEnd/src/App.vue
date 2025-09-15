<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
// import { initSSE } from "src/serverSideEvent";

export default defineComponent({
  name: "App",

  // created() {
  //   initSSE();
  // },
});
</script>
