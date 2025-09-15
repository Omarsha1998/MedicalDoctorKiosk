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
              src="../assets/images/diagnostic1.jpg"
              alt="doctors"
              class="fixed-height-image"
              :class="[$q.screen.name + '-heightPic']"
            />
          </div>
          <div class="col-12">
            <viewCard :title="title" :services="services" />
          </div>
        </div>
      </div>
    </q-page-container>
    <PageScroller />
  </q-layout>
</template>

<script>
import { mapGetters } from "vuex";
import viewCard from "../components/ViewCard.vue";
import PageScroller from "src/components/PageScroller.vue";
import LoadingSkeleton from "src/components/LoadingSkeleton.vue";
import helper from "../store/helpers";

export default {
  data() {
    return {
      services: [],
      title: "DIAGNOSTIC CENTER",
      loadingSkeleton: true,
      loadingCounter: null,
    };
  },

  components: {
    viewCard,
    PageScroller,
    LoadingSkeleton,
  },

  computed: {
    ...mapGetters({
      allServices: "doctorsModule/getServices",
      specialization: "doctorsModule/getSpecialization",
    }),
  },

  methods: {
    async getServices() {
      await helper.delay(100);
      try {
        await this.$store.dispatch("doctorsModule/getServices");
        this.services = this.allServices;
        this.loadingSkeleton = false;
      } catch (error) {
        console.error(error);
      }
    },
  },

  created() {
    this.getServices();
  },
};
</script>

<style></style>
