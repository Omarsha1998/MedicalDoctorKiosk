<template>
  <q-layout>
    <q-page-container>
      <div class="container">
        <!-- <div v-if="loadingSkeleton">
          <LoadingSkeleton />
        </div> -->
        <div class="row q-mt-xl">
          <div class="col-12 text-center lineDoc">
            <span class="line"></span>
            <h3 class="text-bold" :class="[$q.screen.name + '-textTitle']">
              DOCTORS DIRECTORY
            </h3>
            <span class="line"></span>
          </div>
          <div class="inputDiv col-12">
            <div style="width: 100%">
              <div class="row">
                <div
                  class="q-pa-sm"
                  :class="$q.screen.gt.sm ? 'col-4' : 'col-12'"
                >
                  <q-input
                    dense
                    v-model.trim="inputtedDoctor"
                    input-debounce="0"
                    label="Doctor's Name"
                    label-color="blue-10"
                    outlined
                    clearable
                    behavior="menu"
                    fill-input
                    hide-selected
                    @filter="filterFn"
                    use-input
                  />
                </div>

                <div
                  class="q-pa-sm"
                  :class="$q.screen.gt.sm ? 'col-4' : 'col-12'"
                >
                  <q-select
                    dense
                    v-model="selectedDepartment"
                    use-input
                    input-debounce="0"
                    label="Filter by Department / Specialty"
                    label-color="blue-10"
                    outlined
                    :options="departments"
                    option-label="label"
                    option-value="value"
                    @filter="filterFn"
                    behavior="menu"
                    fill-input
                    hide-selected
                    clearable
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey"
                          >No results</q-item-section
                        >
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div
                  class="q-pa-sm"
                  :class="$q.screen.gt.sm ? 'col-4' : 'col-12'"
                >
                  <q-select
                    dense
                    v-model="selectedHmo"
                    use-input
                    input-debounce="0"
                    label="Filter by HMO Accreditation"
                    label-color="blue-10"
                    outlined
                    :options="hmo"
                    option-label="nAME"
                    option-value="cODE"
                    @filter="filterFn"
                    behavior="menu"
                    fill-input
                    hide-selected
                    clearable
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey"
                          >No results</q-item-section
                        >
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Search Button -->
              <!-- <div class="text-center q-pb-md">
                <q-btn
                  class="bg-blue-10 text-yellow-8"
                  label="Find Doctor"
                  push
                  type="submit"
                  @click="searchDoctors(this.selectedDepartment)"
                />
              </div> -->
            </div>
          </div>

          <div class="col-12 q-mt-xl">
            <div class="text-left text-subtitle1 row items-center">
              <q-badge
                v-if="doctorsInCounts !== null"
                :label="doctorsInCounts"
                color="positive"
                text-color="white"
                class="q-ml-sm q-pa-sm text-bold"
                style="
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 18px;
                "
              />
              <q-badge
                v-else
                label="0"
                color="positive"
                text-color="white"
                class="q-ml-sm q-pa-sm text-bold"
                style="
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 18px;
                "
              />
              <span class="q-ml-xs text-blue-10 text-h6 text-bold"
                >Count of Doctors In</span
              >
            </div>
            <div class="q-mt-md">
              <span
                class="q-ml-xs text-black text-subtitle2 text-bold"
                style="word-break: break-word; white-space: normal"
              >
                Click the doctor's row for more information, such as accredited
                Health Maintenance Organization of the doctor.</span
              >
            </div>
          </div>

          <div
            v-if="selectedDepartmentDescription?.length > 0"
            class="col-12 q-pa-none text-center lineDoc"
          >
            <span class="line"></span>
            <div
              class="text-bold q-pa-lg"
              :class="[$q.screen.name + '-textTitle']"
            >
              {{ selectedDepartmentDescription }}
            </div>
            <span class="line"></span>
          </div>
          <div class="col-12 q-mt-lg q-mb-sm" v-else />

          <div v-if="$q.screen.gt.sm" class="col-12 q-mb-xl q-mt-sm">
            <doctorsView
              :doctors="filteredDoctors"
              :secretaryView="false"
              :loading="loading"
              :gridView="false"
              @statusUpdated="getDoctors"
            />
          </div>
          <div class="col-12 q-mb-xl" v-else>
            <doctorsView
              :doctors="filteredDoctors"
              :secretaryView="false"
              :loading="loading"
              :gridView="true"
              @statusUpdated="getDoctors"
            />
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
  <footerLayout @data-emitted="handleSelectedSpecialization" />
</template>

<script>
import { mapGetters } from "vuex";
import helper from "../store/helpers";
import LoadingSkeleton from "src/components/LoadingSkeleton.vue";
import footerLayout from "src/layouts/DoctorsFooter.vue";
import doctorsView from "../components/doctorsTable.vue";
import doctorsViewIframe from "../components/doctorsIframe.vue";
// import { initSSE, listenEvent } from "src/serverSideEvent";

let departmentOptions = [];
let specializationOptions = [];
let hmoOptions = [];

export default {
  data() {
    return {
      isOnline: false,
      loadingCounter: null,
      loadingSkeleton: true,
      selectedDoctorHmo: null,
      specialization: specializationOptions,
      departments: departmentOptions,
      hmo: hmoOptions,
      inputtedDoctor: null,
      selectedDepartment: null,
      selectedDepartmentDescription: null,
      selectedHmo: null,
      secretaryDia: false,
      pollingInterval: null,
      loading: true,
      idleTimer: null,
      idleThreshold: 120 * 1000,
      doctors: null,
    };
  },

  computed: {
    ...mapGetters({
      allDoctors: "doctorsModule/getDoctors",
      allSpecialization: "doctorsModule/getSpecialization",
      allHmos: "doctorsModule/getHmos",
      specializationGetter: "doctorsModule/getSpecialization",
      departmentGetter: "doctorsModule/getDepartments",
      hmoImageGetter: "doctorsModule/getHmoImage",
      doctorsInCounts: "doctorsModule/getDoctorsIn",
      getDoctorsCounts: "doctorsModule/getDoctorsCounts",
    }),

    // doctors() {
    //   return this.$store.state.doctorsModule.doctors || [];
    // },

    filteredDoctors() {
      if (!Array.isArray(this.doctors)) {
        return [];
      }

      const searchDoctor = this.inputtedDoctor?.trim().toLowerCase() || "";
      const searchDept =
        this.selectedDepartment?.value === "All"
          ? ""
          : this.selectedDepartment?.value || "";

      const selectedHmo = this.selectedHmo?.cODE.trim() || "";

      return this.doctors.filter((doc) => {
        const docName = doc.doctorName?.toLowerCase() || "";
        const deptCode = doc.departmentCode?.toLowerCase() || "";
        const specialty = doc.specialtyCodes?.toLowerCase() || "";
        const hmoCodes = doc.hmoCodes
          ? doc.hmoCodes.split(",").map((code) => code.trim())
          : [];

        let passesDoctor = true;
        let passesDepartment = true;
        let passesHmo = true;

        if (searchDoctor) {
          passesDoctor = docName.includes(searchDoctor);
        }

        if (searchDept) {
          passesDepartment =
            deptCode.includes(searchDept.toLowerCase()) ||
            specialty.includes(searchDept.toLowerCase());
        }

        if (selectedHmo) {
          passesHmo = hmoCodes.includes(selectedHmo);
        }

        return passesDoctor && passesDepartment && passesHmo;
      });
    },
  },

  components: {
    footerLayout,
    LoadingSkeleton,
    doctorsView,
    doctorsViewIframe,
  },

  methods: {
    filterFn(val, update) {
      if (val === "") {
        update(() => {
          this.specialization = specializationOptions;
          this.departments = departmentOptions;
          this.hmo = hmoOptions;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.specialization = specializationOptions.filter(
          (option) => option.toLowerCase().indexOf(needle) > -1
        );
        this.departments = departmentOptions.filter(
          (option) => option.label.toLowerCase().indexOf(needle) > -1
        );
        this.hmo = hmoOptions.filter(
          (option) => option.nAME.toLowerCase().indexOf(needle) > -1
        );
      });
    },

    async getDoctors() {
      try {
        this.loading = true;
        await this.$store.dispatch("doctorsModule/getDoctors");
        this.doctors = this.allDoctors;
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.error(error);
      }
    },

    async getDepartments() {
      // await helper.delay(100);
      try {
        await this.$store.dispatch("doctorsModule/getDoctorsDepartment");
        departmentOptions = this.departmentGetter;
        // this.loadingCounter++;
        // if (this.loadingCounter === 1) {
        //   this.loadingSkeleton = false;
        // }
      } catch (error) {
        console.error(error);
      }
    },

    async getHmos() {
      await helper.delay(100);

      try {
        await this.$store.dispatch("doctorsModule/getHmos");
        hmoOptions = this.allHmos;
        // this.loadingCounter++;
        // if (this.loadingCounter === 1) {
        //   this.loadingSkeleton = false;
        // }
      } catch (error) {
        console.error(error);
      }
    },

    async searchDoctors(department = null) {
      this.selectedDepartment = department;
    },

    async handleSelectedSpecialization(department) {
      await this.searchDoctors(department);
    },

    async handleGettingDoctors() {
      try {
        await this.getDoctors();
        // this.loadingCounter++;
        // if (this.loadingCounter === 1) {
        //   this.loadingSkeleton = false;
        // }
      } catch (error) {
        console.error(error);
      }
    },

    // startPolling() {
    //   this.pollingInterval = setInterval(() => {
    //     this.getDoctors();
    //   }, 15000);
    // },

    // stopPolling() {
    //   clearInterval(this.pollingInterval);
    //   this.pollingInterval = null;
    // },

    handleEnterKey(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        this.searchDoctors();
      }
    },

    async handleUserActivity() {
      if (this.idleTimer) {
        clearTimeout(this.idleTimer);
        this.idleTimer = null;
      }

      this.idleTimer = setTimeout(async () => {
        this.selectedDepartment = null;
        await this.getDoctors();
        this.handleUserActivity();
      }, this.idleThreshold);
    },
  },

  created() {
    this.handleGettingDoctors();
    this.getDepartments();
    this.getHmos();
  },

  mounted() {
    clearTimeout(this.idleTimer);
    document.addEventListener("mousemove", this.handleUserActivity);
    document.addEventListener("mousedown", this.handleUserActivity);
    document.addEventListener("keydown", this.handleUserActivity);
    document.addEventListener("touchstart", this.handleUserActivity);
    document.addEventListener("keydown", this.handleEnterKey);

    this.handleUserActivity();
  },

  beforeUnmount() {
    clearTimeout(this.idleTimer);
    document.removeEventListener("mousemove", this.handleUserActivity);
    document.removeEventListener("mousedown", this.handleUserActivity);
    document.removeEventListener("keydown", this.handleUserActivity);
    document.removeEventListener("touchstart", this.handleUserActivity);
    document.removeEventListener("keydown", this.handleEnterKey);
  },
};
</script>
