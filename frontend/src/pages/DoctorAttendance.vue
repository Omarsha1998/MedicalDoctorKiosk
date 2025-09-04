<template>
  <q-layout>
    <q-page-container>
      <div class="mainPageContainer">
        <div class="col-12 q-pt-sm" style="width: 95%" v-if="loading">
          <LoadingSkeleton />
        </div>
        <div v-else class="row" style="width: 95%">
          <div v-if="$q.screen.gt.sm" class="col-12 q-pt-lg">
            <doctorsView
              :doctors="secretaryDoctors"
              :secretaryView="true"
              :gridView="false"
              @statusUpdated="getSecretaryDoctors"
            />
          </div>
          <div v-else class="col-12 q-pt-lg">
            <doctorsView
              :doctors="secretaryDoctors"
              :secretaryView="true"
              :gridView="true"
              @statusUpdated="getSecretaryDoctors"
            />
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>
<script>
import { mapGetters } from "vuex";
import doctorsView from "../components/doctorsTable.vue";
import LoadingSkeleton from "src/components/loading.vue";

// import { initSSE, listenEvent } from "src/serverSideEvent";

export default {
  data() {
    return {
      secretaryDoctors: [],
      loading: false,
    };
  },

  components: {
    doctorsView,
    LoadingSkeleton,
  },

  computed: {
    ...mapGetters({
      secretaryCode: "userModule/getSecretaryCode",
      secretaryDoctorsItem: "doctorsModule/getSecretaryDoctors",
    }),
  },

  methods: {
    async getSecretaryDoctors() {
      try {
        await this.$store.dispatch(
          "doctorsModule/getSecretaryDoctors",
          this.secretaryCode
        );
        this.secretaryDoctors = this.secretaryDoctorsItem;
      } catch (error) {
        console.error(error);
      }
    },

    // startPolling() {
    //   this.pollingInterval = setInterval(() => {
    //     this.getSecretaryDoctors();
    //   }, 15000);
    // },

    // stopPolling() {
    //   clearInterval(this.pollingInterval);
    //   this.pollingInterval = null;
    // },
  },

  mounted() {
    // initSSE();
    // listenEvent(async (message) => {
    //   if (message === "doctorStatusUpdated") {
    //     await this.getSecretaryDoctors();
    //   }
    // });
  },

  created() {
    this.getSecretaryDoctors();
  },
};
</script>
