<template>
  <q-layout>
    <q-page-container>
      <div class="row container">
        <div class="col-12" v-if="loadingSkeleton">
          <LoadingSkeleton />
        </div>
        <div v-else>
          <div class="col-12 q-mt-xl">
            <img
              src="../assets/images/diagnostic2.jpg"
              alt="doctors"
              class="fixed-height-image"
              :class="[$q.screen.name + '-heightPic']"
            />
          </div>
          <div class="col-12">
            <viewCard :title="title" :services="wellnessCenter" />
          </div>
        </div>
      </div>
    </q-page-container>
    <PageScroller />
  </q-layout>
</template>

<script>
import { mapGetters } from "vuex";
import viewCard from "src/components/ViewCard.vue";
import PageScroller from "src/components/PageScroller.vue";
import LoadingSkeleton from "src/components/LoadingSkeleton.vue";
import helper from "../store/helpers";

export default {
  data() {
    return {
      wellnessCenter: [],
      title: "WELLNESS CENTER",
      loadingSkeleton: true,
    };
  },

  components: {
    viewCard,
    PageScroller,
    LoadingSkeleton,
  },

  computed: {
    ...mapGetters({ wellness: "doctorsModule/getWellness" }),
  },

  methods: {
    async getWellness() {
      await helper.delay(100);
      try {
        await this.$store.dispatch("doctorsModule/getWellness");
        this.wellnessCenter = this.wellness;
        this.loadingSkeleton = false;
      } catch (error) {
        console.error(error);
      }
    },
  },

  created() {
    this.getWellness();
  },
};
</script>
