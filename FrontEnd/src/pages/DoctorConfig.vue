<template>
  <q-layout>
    <q-page-container>
      <div class="mainPageContainer">
        <div class="col-12 q-pt-sm" style="width: 95%" v-if="loading">
          <LoadingSkeleton />
        </div>
        <div v-else class="row q-pt-lg" style="width: 95%">
          <div v-if="$q.screen.gt.sm" class="col-12 q-pt-lg">
            <doctorsView
              :doctors="doctors"
              :doctorConfig="true"
              :hmosOptions="hmoOptions"
              :gridView="false"
              @statusUpdated="emitted"
            />
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>
<script>
import { mapGetters } from "vuex";
import doctorsView from "src/components/doctorsTable.vue";
import LoadingSkeleton from "src/components/loading.vue";

export default {
  data() {
    return {
      doctors: [],
      loading: true,
      allHmos: null,
      loadingCounter: null,
    };
  },

  components: {
    doctorsView,
    LoadingSkeleton,
  },

  computed: {
    ...mapGetters({
      allDoctors: "doctorsModule/getDoctors",
      hmoOptions: "doctorsModule/getHmos",
    }),
  },

  methods: {
    async getDoctors() {
      try {
        await this.$store.dispatch("doctorsModule/getDoctors");
        this.doctors = this.allDoctors;
        this.loadingCounter++;
        if (this.loadingCounter === 2) {
          this.loading = false;
        }
      } catch (error) {
        this.loading = false;
        console.error(error);
      }
    },

    async getHmos() {
      try {
        await this.$store.dispatch("doctorsModule/getHmos");
        this.loadingCounter++;
        if (this.loadingCounter === 2) {
          this.loading = false;
        }
      } catch (error) {
        error(error);
      }
    },

    async emitted() {
      this.loading = true;
      await this.getDoctors();
      this.loading = false;
    },
  },

  created() {
    this.getDoctors();
    this.getHmos();
  },
};
</script>
