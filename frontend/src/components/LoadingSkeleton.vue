<template>
  <div class="q-pt-xl">
    <q-skeleton
      :class="[$q.screen.name + '-heightPic']"
      :animation="skeletonAnimation"
    />

    <q-skeleton
      :style="{
        marginTop: '50px',
      }"
      :class="[$q.screen.name + '-textTitle']"
      :animation="skeletonAnimation"
    />

    <q-skeleton
      :style="{
        marginTop: '50px',
      }"
      :class="[$q.screen.name + '-heightPic']"
      :animation="skeletonAnimation"
    />
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
