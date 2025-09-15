<template>
  <q-select
    class="q-pb-md"
    dense
    v-model="status"
    use-input
    input-debounce="0"
    label="Filter By Status"
    label-color="blue-10"
    outlined
    :options="statusOptions"
    behavior="menu"
    fill-input
    hide-selected
    clearable
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">No results</q-item-section>
      </q-item>
    </template>
  </q-select>
  <div class="row q-mt-md">
    <q-card
      v-for="(doctor, index) in computedDoctors"
      :key="doctor.cODE"
      class="transparent-card-doctors"
      :style="getCardStyle(index)"
    >
      <q-card-section class="q-pa-none" style="height: 100%">
        <div class="img-wrapper clickable" @click="selectedDocDialog(doctor)">
          <q-img
            :src="
              doctor.picture
                ? doctor.picture
                : doctor.gENDER === 'M'
                ? docMale
                : docFemale
            "
            class="zoomable-img"
            img-class="full-height"
            style="height: 100%; width: 100%; object-fit: cover; padding: 5px"
          >
            <div
              class="absolute-bottom"
              style="
                background-color: rgba(25, 75, 170, 0.8);
                color: white;
                padding: 8px;
                word-break: break-word;
                white-space: normal;
                width: 100%;
                box-sizing: border-box;
              "
            >
              <div
                class="text-subtitle1 doctorName"
                style="word-break: break-word; white-space: normal"
              >
                {{ doctor.doctorName }}
              </div>
              <div
                class="text-caption text-bold"
                style="word-break: break-word; white-space: normal"
              >
                {{
                  doctor.specialization
                    ? doctor.specialization
                    : "Not Specified"
                }}
              </div>
            </div>
          </q-img>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <doctorDia
    v-if="doctorsDialog"
    :dataDoctor="selectedDoctor"
    :dataDoctorHmo="selectedDoctorHmo"
    :slideValue="slide"
    @close="closeDoctorsDialog"
  />

  <div class="row q-mb-xl">
    <div class="col-12 text-center">
      <q-btn
        v-if="doctors.length > displayedDoctors.length"
        class="text-yellow-8"
        label="Load More"
        color="blue-10"
        @click="loadMore"
      />
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import helperMethods from "src/helperMethods";
import doctorDia from "./selectedDoctorDialog.vue";
import docMale from "assets/images/doctorMale.png";
import docFemale from "assets/images/doctorFemale.png";
// import { emitEvent, socket } from "src/socket";

export default {
  data() {
    return {
      doctorsItem: this.doctors,
      selectedDoctorHmo: null,
      selectedDoctor: null,
      slide: null,
      doctorsDialog: false,
      loadLimit: 20,
      displayedCount: 20,
      status: "All",
      statusOptions: ["All", "In Clinic", "Out"],
      imageApi: process.env.ImageApi,
      docMale,
      docFemale,
    };
  },

  emits: ["statusUpdated"],

  props: {
    doctors: Array,
    secretaryView: Boolean,
  },

  components: {
    doctorDia,
  },

  computed: {
    ...mapGetters({
      hmoImageGetter: "doctorsModule/getHmoImage",
    }),

    columns() {
      if (this.$q.screen.gt.md) return 4;
      if (this.$q.screen.gt.sm) return 3;
      if (this.$q.screen.gt.xs) return 2;
      if (this.$q.screen.gt.xs) return 1;
    },

    displayedDoctors() {
      return this.doctors.slice(0, this.displayedCount);
    },

    computedDoctors() {
      if (!Array.isArray(this.doctors)) return [];

      return this.doctors
        .filter((doctor) => {
          if (this.status === "All") return true; // Return all doctors

          const isInClinic = doctor.isOnDuty === 1;
          return this.status === "In Clinic" ? isInClinic : !isInClinic;
        })
        .slice(0, this.displayedCount); // Apply slicing
    },
  },
  methods: {
    getCardStyle(index) {
      return helperMethods.getCardStyle(index, this.columns);
    },

    async selectedDocDialog(doctorsInfo) {
      this.selectedDoctor = doctorsInfo;
      if (
        this.selectedDoctor.employeeCode === null ||
        !this.selectedDoctor.employeeCode ||
        this.selectedDoctor.employeeCode.length === 0
      ) {
        this.doctorsDialog = true;
        return;
      }
      await this.$store.dispatch(
        "doctorsModule/getDoctorHmo",
        this.selectedDoctor.doctorCode
      );
      this.selectedDoctorHmo = [...this.hmoImageGetter].sort((a, b) =>
        a.hmoDescription.localeCompare(b.hmoDescription)
      );
      if (this.selectedDoctorHmo.length > 0) {
        this.slide = this.selectedDoctorHmo[0].hmoDescription;
      }
      this.doctorsDialog = true;
    },

    async toggleStatusSecretary(doctorsData) {
      try {
        helperMethods.disablePointerEvents();
        const data = {
          doctorCodeParam: doctorsData.doctorEhrCode,
        };

        const response = await this.$store.dispatch(
          "doctorsModule/checkDoctorAttendance",
          data
        );
        this.$q
          .dialog({
            title: "Confirmation",
            message: `${response.body}`,
            persistent: true,
            ok: {
              push: true,
              color: "blue-10",
              label: "Confirm",
              class: "text-subtitle1",
            },
            cancel: {
              push: true,
              color: "negative",
              label: "Cancel",
              class: "text-subtitle1",
            },
          })
          .onOk(async () => {
            this.loader = true;
            await this.$store.dispatch(
              "doctorsModule/updateDoctorStatus",
              doctorsData
            );
            this.$q.notify({
              color: "positive",
              position: "center",
              message: `Doctor schedule recorded successfully`,
              icon: "check",
              iconColor: "white",
              timeout: 1500,
              progress: true,
            });
            this.loader = false;
            this.$emit("statusUpdated");
            // emitEvent("doctorStatusUpdated");
            helperMethods.enablePointerEvents();
          })
          .onCancel(() => {
            helperMethods.enablePointerEvents();
          })
          .onDismiss(() => {
            helperMethods.enablePointerEvents();
          });
      } catch (error) {
        helperMethods.enablePointerEvents();
        if (error.response.status === 409) {
          this.$q.notify({
            color: "negative",
            position: "center",
            message: `${error.response.data.body}`,
            icon: "report_problem",
            iconColor: "white",
            timeout: 1500,
            progress: true,
          });
        }
        console.error(error);
      }
    },

    closeDoctorsDialog() {
      this.slide = null;
      this.selectedDoctorHmo = null;
      this.doctorsDialog = false;
    },

    loadMore() {
      this.displayedCount += this.loadLimit;
    },
  },
};
</script>
