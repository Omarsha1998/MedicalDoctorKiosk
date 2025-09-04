<template>
  <div class="q-pt-xl">
    <q-skeleton style="height: 750px" :animation="skeletonAnimation" />
  </div>
</template>

<script>
export default {
  props: {},

  data() {
    return {
      skeletonAnimation: "fade",
    };
  },
};
</script>
