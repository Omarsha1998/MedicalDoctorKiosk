<template>
  <q-layout>
    <q-page-container>
      <div class="container">
        <Loader :isLoading="loader" />
        <div v-if="loadingSkeleton">
          <LoadingSkeleton />
        </div>
        <div v-else class="row">
          <div class="col-12 q-mt-lg full-width">
            <img
              src="../assets/images/doctors.jpg"
              alt="doctors"
              class="fixed-height-image"
              :class="[$q.screen.name + '-heightPic']"
            />
          </div>
          <div class="col-12 text-center lineDoc">
            <span class="line"></span>
            <h3 class="text-bold" :class="[$q.screen.name + '-textTitle']">
              DOCTOR'S DIRECTORY
            </h3>
            <span class="line"></span>
          </div>
          <div class="col-12">
            <q-card style="width: 100%" class="bg-grey-2">
              <q-card-section class="row">
                <div
                  class="q-pa-sm"
                  :class="$q.screen.gt.sm ? 'col-6' : 'col-12'"
                >
                  <q-input
                    v-model="inputtedDoctor"
                    class="hoverable-item"
                    input-debounce="0"
                    label="Doctor's Name"
                    filled
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
                  :class="$q.screen.gt.sm ? 'col-6' : 'col-12'"
                >
                  <q-select
                    filled
                    v-model="selectedDepartment"
                    use-input
                    input-debounce="0"
                    label="Filter by Department"
                    :options="departments"
                    option-label="label"
                    option-value="value"
                    @filter="filterFn"
                    behavior="menu"
                    fill-input
                    hide-selected
                    class="hoverable-item"
                    clearable
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <div
                  class="q-pa-sm"
                  :class="$q.screen.gt.sm ? 'col-6' : 'col-12'"
                >
                  <q-select
                    filled
                    v-model="selectedHmo"
                    use-input
                    input-debounce="0"
                    label="Filter by HMO Accredited"
                    :options="hmo"
                    option-label="nAME"
                    option-value="cODE"
                    @filter="filterFn"
                    behavior="menu"
                    fill-input
                    hide-selected
                    class="hoverable-item"
                    clearable
                    ref="hmoSelect"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <div
                  class="q-pa-sm"
                  :class="$q.screen.gt.sm ? 'col-6' : 'col-12'"
                >
                  <div class="q-pt-sm">
                    <q-checkbox
                      v-model="isMale"
                      color="blue-10"
                      label="Male"
                      @update:model-value="onGenderChange('Male')"
                    />
                    <q-checkbox
                      v-model="isFemale"
                      color="pink"
                      label="Female"
                      @update:model-value="onGenderChange('Female')"
                    />
                    <q-checkbox
                      v-model="allGender"
                      color="yellow-8"
                      label="All Gender"
                      @update:model-value="onGenderChange('All')"
                    />
                  </div>
                </div>
              </q-card-section>
              <div class="text-center q-pb-md">
                <q-btn
                  class="bg-blue-10 text-yellow-8"
                  label="Search"
                  push
                  @click="
                    searchDoctors(
                      selectedDepartment,
                      inputtedDoctor,
                      gender,
                      selectedHmo
                    )
                  "
                ></q-btn>
              </div>
            </q-card>
          </div>

          <div class="col-12 q-mt-xl"></div>

          <div class="col-12" style="width: 100%">
            <div>
              <q-input
                class="bg-yellow-8"
                v-model="searchText"
                filled
                dense
                outlined
                clearable
                label="Search"
                label-color="blue-10"
                style="border-radius: 10px"
                @clear="clearSearchText"
              />
            </div>

            <div class="row q-mt-md">
              <q-card
                v-for="(doctor, index) in computedDoctors"
                :key="doctor.cODE"
                :class="
                  ([$q.screen.gt.sm ? 'col-4' : 'col-12'],
                  'transparent-card-doctors')
                "
                :style="getCardStyle(index)"
              >
                <q-card-section
                  class="q-pa-none text-center"
                  style="
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                  "
                >
                  <div style="width: 100%">
                    <!-- <img
                      :src="imageSrc(doctor.doctorEhrCode, doctor.gENDER)"
                      alt="Doctor Photo"
                      contain
                      style="width: 100%; height: 100%; object-fit: cover"
                    /> -->
                    <img
                      :src="doctorImages[doctor.doctorEhrCode]"
                      alt="Doctor Photo"
                      style="width: 100%; height: 100%; object-fit: cover"
                    />
                  </div>

                  <!-- <div
                    v-else
                    style="width: 100%; height: 275px; padding-top: 10px"
                  >
                    <img
                      v-if="doctor.gENDER === 'M'"
                      src="../assets//images/doctormen.png"
                      alt="image"
                      style="width: 100%; height: 100%"
                    />

                    <img
                      v-else
                      src="../assets//images/doctorwomen.png"
                      alt="image"
                      style="width: 100%; height: 100%"
                    />
                  </div> -->

                  <div
                    class="doctorName text-subtitle1 q-pt-sm q-pr-sm q-pl-sm"
                    style="
                      word-break: break-word;
                      white-space: normal;
                      max-width: 100%;
                    "
                  >
                    {{ doctor.doctorName }}
                  </div>

                  <q-item-section>
                    <div
                      class="text-bold"
                      style="
                        word-break: break-word;
                        white-space: normal;
                        max-width: 100%;
                      "
                    >
                      {{
                        doctor.specialization
                          ? doctor.specialization
                          : "Not Specified"
                      }}
                    </div>
                  </q-item-section>

                  <q-btn
                    class="full-width bg-blue-10 text-yellow-8"
                    style="border-radius: 0 0 10px 10px; margin-top: 10px"
                    label="View More"
                    push
                    @click="selectedDocDialog(doctor)"
                  />
                </q-card-section>
              </q-card>
            </div>

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
          </div>
        </div>
      </div>

      <q-dialog v-model="doctorsDialog" persistent>
        <q-card
          class="bg-grey-2"
          style="
            margin: 0;
            border-radius: 0;
            display: flex;
            flex-direction: column;
            max-width: 1000px;
            border-radius: 10px;
          "
          :class="['bold-text', $q.screen.name + '-text']"
        >
          <q-card-section class="q-pa-none">
            <div
              class="bg-blue-10 row items-center q-pa-md"
              style="position: sticky; top: 0; z-index: 1"
            >
              <div class="text-yellow-8 text-bold">DOCTOR'S INFORMATION</div>
              <q-space></q-space>
              <q-btn
                class="bg-yellow-8 text-blue-10"
                icon="close"
                input-debounce="0"
                push
                round
                dense
                @click="closeDoctorsDialog"
              ></q-btn>
            </div>
          </q-card-section>
          <q-card-section
            class="q-pa-none"
            :class="[
              'bold-text',
              $q.screen.name + '-text',
              'virtual-scroll-dialog',
            ]"
          >
            <div class="row">
              <div
                :class="[$q.screen.gt.sm ? 'col-6' : 'col-12']"
                class="flex flex-center q-pa-md"
              >
                <div
                  v-if="selectedDoctor.doctorEhrCode"
                  style="width: 100%; height: 270px"
                >
                  <img
                    :src="imageApi + selectedDoctor.doctorEhrCode"
                    alt="image"
                    style="width: 100%; height: 100%; object-fit: contain"
                  />
                </div>
                <div
                  v-else
                  style="width: 100%; height: 275px; padding-top: 10px"
                >
                  <img
                    v-if="selectedDoctor.gENDER === 'M'"
                    src="../assets//images/doctormen.png"
                    alt="image"
                    style="width: 100%; height: 100%; object-fit: contain"
                  />

                  <img
                    v-else
                    src="../assets//images/doctorwomen.png"
                    alt="image"
                    style="width: 100%; height: 100%; object-fit: contain"
                  />
                </div>
              </div>
              <div
                class="q-pr-sm q-mt-sm text-left"
                :class="[$q.screen.gt.sm ? 'col-6' : 'col-12']"
                style="
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                "
              >
                <div class="row" style="width: 100%">
                  <div
                    class="col-12 text-blue-10 text-h5"
                    style="
                      width: 100%;
                      word-wrap: break-word;
                      font-weight: bold;
                    "
                  >
                    {{ selectedDoctor.doctorName }}
                  </div>
                  <div class="col-12 text-h6">
                    {{
                      selectedDoctor.specialization
                        ? selectedDoctor.specialization
                        : "Not Specified"
                    }}
                  </div>
                  <div class="col-12 text-subtitle1">
                    <div
                      v-if="
                        selectedDoctor.cONTACTNOS &&
                        selectedDoctor.cONTACTNOS.trim() !== ''
                      "
                    >
                      {{ selectedDoctor.cONTACTNOS }}
                    </div>
                    <div v-else>No Contact Numbers Specified</div>
                  </div>
                  <div class="col-12 text-subtitle1">
                    <div
                      v-if="
                        selectedDoctor.rOOM && selectedDoctor.rOOM.trim() !== ''
                      "
                    >
                      ROOM {{ selectedDoctor.rOOM }}
                    </div>
                    <div v-else>No Room Designated</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="q-pa-md">
              <div style="border: 1px solid #ccc">
                <q-item-section class="bg-yellow-8 q-pa-xs text-bold text-h6">
                  <div class="col text-blue-10">CLINIC SCHEDULE</div>
                </q-item-section>
              </div>
              <div style="border: 1px solid #ccc">
                <div class="q-pa-xs text-subtitle1">
                  {{
                    selectedDoctor.sKED && selectedDoctor.sKED.trim() !== ""
                      ? selectedDoctor.sKED
                      : "No Schedule Specified"
                  }}
                </div>
              </div>
            </div>

            <div class="q-pa-md">
              <div style="border: 1px solid #ccc">
                <q-item-section class="bg-yellow-8 q-pa-xs text-bold text-h6">
                  <div class="col text-blue-10">
                    HEALTH MAINTENANCE ORGANIZATION ACCREDITED
                  </div>
                </q-item-section>
              </div>

              <div
                v-if="selectedDoctorHmo"
                style="border: 1px solid #ccc; height: 250px; overflow: hidden"
              >
                <div
                  class="q-pa-xs"
                  style="
                    max-height: 100%;
                    display: flex;
                    flex-direction: column;
                  "
                >
                  <q-carousel
                    class="bg-transparent"
                    animated
                    v-model="slide"
                    navigation
                    infinite
                    :autoplay="autoplay"
                    arrows
                    transition-prev="slide-right"
                    transition-next="slide-left"
                    @mouseenter="autoplay = true"
                    @mouseleave="autoplay = true"
                  >
                    <template v-slot:navigation-icon="{ active, onClick }">
                      <q-btn
                        v-if="active"
                        class="bg-blue-10 custom-btn"
                        flat
                        round
                        @click="onClick"
                      ></q-btn>
                      <q-btn
                        v-else
                        flat
                        class="bg-yellow-8 custom-btn"
                        round
                        @click="onClick"
                      ></q-btn>
                    </template>
                    <q-carousel-slide
                      v-for="doctor in selectedDoctorHmo"
                      :key="doctor.hmoDescription"
                      :name="doctor.hmoDescription"
                      class="column items-center justify-center"
                    >
                      <div class="text-center">
                        <div
                          v-if="doctor.imageFile === null || !doctor.imageFile"
                          class="text-bold"
                          style="font-size: 20px"
                        >
                          {{ doctor.hmoDescription }}
                        </div>
                        <img
                          v-else
                          :src="doctor.imageFile"
                          alt="image"
                          style="width: 100%; height: 100%"
                        />
                      </div>
                    </q-carousel-slide>
                  </q-carousel>
                </div>
              </div>
              <div
                v-else
                style="border: 1px solid #ccc; overflow: hidden"
                class="q-pa-xs text-subtitle1"
              >
                No Health Maintenance Organizations accredited.
              </div>
            </div>

            <div class="q-pa-md">
              <div style="border: 1px solid #ccc">
                <q-item-section class="bg-yellow-8 q-pa-xs text-bold text-h6">
                  <div class="col text-blue-10">MORE INFORMATION</div>
                </q-item-section>
              </div>

              <div style="border: 1px solid #ccc">
                <div class="q-pa-xs text-subtitle1">
                  For appointments, more details, questions, or inquiries,
                  <span
                    v-if="
                      !selectedDoctor.secName1 &&
                      !selectedDoctor.secMPN1 &&
                      !selectedDoctor.secName2 &&
                      !selectedDoctor.secMPN2
                    "
                  >
                    please feel free to visit the doctor's room or office during
                    their scheduled hours.
                  </span>
                  <span v-else>
                    please feel free to contact the doctor's secretary listed
                    below.
                  </span>
                </div>

                <div
                  class="q-pa-xs text-subtitle1"
                  v-if="selectedDoctor.secName1 && selectedDoctor.secMPN1"
                >
                  <span class="text-bold">Secretary:</span>
                  {{ selectedDoctor.secName1 }} ({{ selectedDoctor.secMPN1 }})
                </div>

                <div
                  v-if="selectedDoctor.secName2 && selectedDoctor.secMPN2"
                  class="q-pa-xs text-subtitle1"
                >
                  <span class="text-bold">Secretary:</span>
                  {{ selectedDoctor.secName2 }} ({{ selectedDoctor.secMPN2 }})
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
      <PageScroller />
    </q-page-container>
  </q-layout>
  <!-- <footerLayout @data-emitted="handleSelectedSpecialization" /> -->
</template>

<script>
import { mapGetters } from "vuex";
import helper from "../store/helpers";
import PageScroller from "../components/PageScroller.vue";
import Loader from "../components/Loader.vue";
import LoadingSkeleton from "src/components/LoadingSkeleton.vue";
import footerLayout from "src/layouts/DoctorsFooter.vue";

let specializationOptions = [];
let departmentOptions = [];

let hmoOptions = [];

export default {
  data() {
    return {
      slide: null,
      autoplay: true,
      imageApi: process.env.ImageApi,
      doctors: [],
      specialization: specializationOptions,
      departments: departmentOptions,
      selectedDepartment: null,
      hmo: hmoOptions,
      selectedHmo: null,
      inputtedDoctor: null,
      loadLimit: 20,
      displayedCount: 20,
      doctorsDialog: false,
      selectedDoctor: null,
      isSelectOpen: false,
      gender: null,
      isMale: false,
      isFemale: false,
      allGender: false,
      loader: false,
      loadingSkeleton: true,
      loadingCounter: null,
      searchText: "",
      selectedDoctorHmo: null,
      imageApi: process.env.ImageApiLocal,
      doctorImages: {},
    };
  },

  components: {
    PageScroller,
    Loader,
    LoadingSkeleton,
    footerLayout,
  },

  computed: {
    ...mapGetters({
      allDoctors: "doctorsModule/getDoctors",
      allSpecialization: "doctorsModule/getSpecialization",
      allHmos: "doctorsModule/getHmos",
      specializationGetter: "doctorsModule/getSpecialization",
      departmentGetter: "doctorsModule/getDepartments",
      hmoImageGetter: "doctorsModule/getHmoImage",
    }),

    specializationLinks() {
      return this.specializationGetter;
    },

    displayedDoctors() {
      return this.doctors.slice(0, this.displayedCount);
    },

    columns() {
      if (this.$q.screen.gt.lg) return 5;
      if (this.$q.screen.gt.md) return 4;
      if (this.$q.screen.gt.sm) return 3;
      if (this.$q.screen.gt.xs) return 2;
    },

    computedDoctors() {
      if (Array.isArray(this.doctors)) {
        const query = this.searchText.toLowerCase();
        const filter = this.doctors.filter((row) => {
          return (
            row.doctorName &&
            row.doctorName.toString().toLowerCase().includes(query)
          );
        });
        return filter.slice(0, this.displayedCount);
      }
    },
  },

  methods: {
    async imageSrc(doctorEhrCode, gender) {
      const apiImg = await this.$store.dispatch(
        "doctorsModule/picture",
        doctorEhrCode
      );
      return apiImg;
    },

    async handleSelectedSpecialization(department) {
      await this.searchDoctors(department, null, null, null);
    },

    clearSearchText() {
      this.searchText = "";
    },

    onGenderChange(value) {
      if (value === "Male" && this.isMale) {
        this.gender = "Male";
        this.isFemale = false;
        this.allGender = false;
      } else if (value === "Female" && this.isFemale) {
        this.gender = "Female";
        this.isMale = false;
        this.allGender = false;
      } else if (value === "All" && this.allGender) {
        this.gender = "All";
        this.isMale = false;
        this.isFemale = false;
      } else {
        this.gender = null;
      }
    },

    getCardStyle(index) {
      const totalColumns = this.columns;
      const isFirstInRow = index % totalColumns === 0;
      const isLastInRow = (index + 1) % totalColumns === 0;

      const styles = {
        marginLeft: "0px",
        marginRight: "0px",
        marginBottom: "50px",
        width: this.getCardWidth(totalColumns),
      };

      if (totalColumns === 5) {
        if (!isLastInRow) {
          styles.marginRight = "37px";
        }
      }

      if (totalColumns === 4) {
        if (!isLastInRow) {
          styles.marginRight = "40px";
        }
      }

      if (totalColumns === 3) {
        if (!isLastInRow) {
          styles.marginRight = "45px";
        }
      }

      if (totalColumns === 2) {
        if (!isLastInRow) {
          styles.marginRight = "60px";
        }
      }

      return styles;
    },

    getCardWidth(totalColumns) {
      switch (totalColumns) {
        case 5:
          return "calc(20% - 30px)";
        case 4:
          return "calc(25% - 30px)";
        case 3:
          return "calc(33.33% - 30px)";
        case 2:
          return "calc(50% - 30px)";
        default:
          return "100%";
      }
    },

    loadMore() {
      this.displayedCount += this.loadLimit;
    },

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
      this.selectedDoctorHmo = this.hmoImageGetter;
      if (this.selectedDoctorHmo.length > 0) {
        this.slide = this.selectedDoctorHmo[0].hmoDescription;
      }

      this.doctorsDialog = true;
    },

    closeDoctorsDialog() {
      this.selectedDoctorHmo = null;
      this.doctorsDialog = false;
    },

    async getDoctors() {
      await helper.delay(100);
      try {
        await this.$store.dispatch("doctorsModule/getDoctors");
        this.doctors = this.allDoctors;
        this.loadingCounter++;
        if (this.loadingCounter === 2) {
          this.loadingSkeleton = false;
        }
      } catch (error) {
        console.error(error);
      }
    },

    async getDepartments() {
      await helper.delay(100);
      try {
        await this.$store.dispatch("doctorsModule/getDoctorsDepartment");
        departmentOptions = this.departmentGetter;
      } catch (error) {
        console.error(error);
      }
    },

    async getHmos() {
      await helper.delay(100);

      try {
        await this.$store.dispatch("doctorsModule/getHmos");
        hmoOptions = this.allHmos;
        this.loadingCounter++;
        if (this.loadingCounter === 2) {
          this.loadingSkeleton = false;
        }
      } catch (error) {
        console.error(error);
      }
    },

    async searchDoctors(
      selectedDepartment,
      inputtedDoctor,
      gender,
      selectedHmo
    ) {
      if (!selectedDepartment && !inputtedDoctor && !gender && !selectedHmo) {
        this.$q.notify({
          color: "negative",
          position: "center",
          message: "Input the Required Field",
          icon: "report_problem",
          iconColor: "white",
          timeout: 1000,
          progress: true,
        });
        return;
      }

      this.loader = true;
      await helper.delay(100);
      helper.disablePointerEvents();
      try {
        const data = {
          departmentName: selectedDepartment ? selectedDepartment.value : "",
          doctorName: inputtedDoctor || "",
          gender: this.gender === "Male" ? "M" : gender === "Female" ? "F" : "",
          hmo: selectedHmo ? selectedHmo.cODE : "",
        };

        await this.$store.dispatch("doctorsModule/getDoctors", data);

        this.doctors = this.allDoctors;

        // specializationOptions = [
        //   ...new Set(
        //     this.doctors
        //       .filter((doctor) => doctor?.departmentName)
        //       .map((doctor) => doctor.departmentName)
        //   ),
        // ].sort((a, b) => a.localeCompare(b));
        this.loader = false;
        helper.enablePointerEvents();
      } catch (error) {
        this.loader = false;
        console.error(error);
        helper.enablePointerEvents();
      }
    },

    isValidEmployeeCode(employeeCode) {
      return employeeCode && employeeCode.trim().length > 0;
    },

    async loadDoctorImage(code, gender) {
      if (this.doctorImages[code]) return;

      try {
        const base64Image = await this.$store.dispatch(
          "doctorsModule/picture",
          code
        );
        this.doctorImages[code] = base64Image || this.getDefaultImage(gender);
      } catch (error) {
        console.error(`Failed to load image for ${code}`, error);
        this.doctorImages[code] = this.getDefaultImage(gender);
      }
    },

    getDefaultImage(gender) {
      return gender === "M"
        ? new URL("../assets/images/doctormen.png", import.meta.url).href
        : new URL("../assets/images/doctorwomen.png", import.meta.url).href;
    },
  },

  async created() {
    await this.getDoctors();
    this.getDepartments();
    this.getHmos();
  },

  watch: {
    computedDoctors: {
      handler(doctors) {
        doctors.forEach((doctor) => {
          this.loadDoctorImage(doctor.doctorEhrCode, doctor.gENDER);
        });
      },
      immediate: true,
    },
  },
};
</script>
