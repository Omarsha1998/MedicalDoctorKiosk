<template>
  <div>
    <div
      v-if="gridView"
      class="row q-mt-md"
      style="max-height: 2700px; overflow: hidden"
    >
      <q-card
        v-for="(doctor, index) in paginatedDoctors"
        :key="doctor.cODE"
        :class="
          ([$q.screen.gt.sm ? 'col-4' : 'col-12'], 'transparent-card-doctors')
        "
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

    <!-- Pagination Controls -->
    <div
      v-if="gridView && totalPages > 1"
      class="row justify-center items-center q-gutter-md"
    >
      <!-- Left Arrow -->
      <q-btn
        :disable="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        icon="chevron_left"
        color="primary"
        outline
        size="sm"
      />

      <!-- Page Numbers in Middle -->
      <div class="row items-center">
        <q-btn
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :color="currentPage === page ? 'primary' : 'grey-6'"
          :outline="currentPage !== page"
          :unelevated="currentPage === page"
          :label="page"
          size="sm"
          class="q-mr-xs"
          style="min-width: 40px"
        />
      </div>

      <!-- Right Arrow -->
      <q-btn
        :disable="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
        icon="chevron_right"
        color="primary"
        outline
        size="sm"
      />
    </div>

    <doctorDia
      v-if="doctorsDialog"
      :dataDoctor="selectedDoctor"
      :dataDoctorHmo="selectedDoctorHmo"
      :dataDoctorSchedule="selectedDoctorSched"
      :dataDoctorEducation="selectedDoctorEduc"
      :dataDoctorContacts="selectedDoctorContact"
      :slideValue="this.slide"
      @close="closeDoctorsDialog"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import doctorDia from "src/components/selectedDoctorDialog.vue";
import helperMethods from "src/helperMethods";
import Loader from "./Loader.vue";
import docMale from "assets/images/doctorMale.png";
import docFemale from "assets/images/doctorFemale.png";

export default {
  emits: ["statusUpdated"],
  props: {
    doctors: Object,
    secretaryView: Boolean,
    loading: Boolean,
    gridView: Boolean,
  },
  data() {
    return {
      doctorsColumn: [
        {
          name: "status",
          label: "Status",
          align: "center",
          field: "",
          width: "200px",
        },
        {
          name: "doctorName",
          label: "Doctor",
          align: "left",
          field: "doctorName",
          width: "200px",
        },
        {
          name: "room",
          label: "Room",
          align: "center",
          field: "rOOM",
          width: "100px",
        },
        {
          name: "specialty",
          label: "Specialty",
          align: "center",
          field: "specialtyDesc",
          width: "200px",
        },
        {
          name: "subSpecialtyDesc",
          label: "Subspecialty",
          align: "center",
          field: "subSpecialtyDesc",
          width: "200px",
        },
        {
          name: "schedule",
          label: "Schedule",
          align: "center",
          field: "",
          width: "150px",
        },
        {
          name: "secretary",
          label: "Secretary",
          align: "center",
          field: "secretary",
          width: "150px",
        },
      ],
      searchText: "",
      selectedDoctor: null,
      selectedDoctorHmo: null,
      doctorsDialog: false,
      isOnline: false,
      slide: null,
      loader: false,
      status: "All",
      statusOptions: ["All", "In Clinic", "Out"],
      docMale,
      docFemale,
      selectedDoctorSched: [],
      selectedDoctorEduc: [],
      selectedDoctorContact: [],
      // Pagination data
      currentPage: 1,
      itemsPerPage: 6, // Default, will be calculated based on screen size
    };
  },

  components: {
    doctorDia,
    Loader,
  },

  computed: {
    ...mapGetters({
      hmoImageGetter: "doctorsModule/getHmoImage",
      validation: "userModule/hasValues",
    }),

    computedDoctors() {
      if (!Array.isArray(this.doctors)) return [];

      const query = (this.searchText || "").toLowerCase();

      return this.doctors.filter((doctor) => {
        const matchesSearch = doctor.doctorName
          ?.toString()
          .toLowerCase()
          .includes(query);

        if (!matchesSearch) return false;

        if (this.status === "All") return true;

        const isInClinic = doctor.isOnDuty === 1;
        return this.status === "In Clinic" ? isInClinic : !isInClinic;
      });
    },

    columns() {
      if (this.$q.screen.gt.md) return 4;
      if (this.$q.screen.gt.sm) return 3;
      if (this.$q.screen.gt.xs) return 2;
      return 1;
    },

    // Calculate how many items can fit in 1800px height
    calculatedItemsPerPage() {
      const cardHeight = 550;
      const cardMarginBottom = 10;
      const totalCardHeight = cardHeight + cardMarginBottom;
      const maxHeight = 2700;
      const columns = this.columns;

      // Calculate how many rows can fit
      const rowsPerPage = Math.floor(maxHeight / totalCardHeight);

      // Total items = rows * columns
      return rowsPerPage * columns;
    },

    totalPages() {
      return Math.ceil(
        this.computedDoctors.length / this.calculatedItemsPerPage
      );
    },

    paginatedDoctors() {
      const start = (this.currentPage - 1) * this.calculatedItemsPerPage;
      const end = start + this.calculatedItemsPerPage;
      return this.computedDoctors.slice(start, end);
    },

    visiblePages() {
      const total = this.totalPages;
      const current = this.currentPage;
      const delta = 2;

      let start = Math.max(1, current - delta);
      let end = Math.min(total, current + delta);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(total, start + 4);
        } else if (end === total) {
          start = Math.max(1, end - 4);
        }
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },

  watch: {
    searchText() {
      this.currentPage = 1;
    },
    status() {
      this.currentPage = 1;
    },
    columns() {
      this.currentPage = 1;
    },
  },

  methods: {
    formatTime(dateTimeString) {
      if (!dateTimeString) return "-";

      const parts = dateTimeString.split(" ");
      return parts.slice(-2).join("");
    },

    // Simple approach - just send the essential data
    async selectedDocDialog(doctorsInfo) {
      // Prepare all the doctor data as you currently do
      this.selectedDoctor = doctorsInfo;

      await this.$store.dispatch(
        "doctorsModule/getDoctorHmo",
        this.selectedDoctor.doctorCode
      );

      const contact = await this.$store.dispatch(
        "doctorsModule/doctorContacts",
        doctorsInfo.doctorEhrCode
      );
      this.selectedDoctorContact = contact ? contact : null;

      const sched = await this.$store.dispatch(
        "doctorsModule/doctorSchedule",
        doctorsInfo.doctorEhrCode
      );
      this.selectedDoctorSched = sched ? sched : null;

      const education = await this.$store.dispatch(
        "doctorsModule/doctorEducation",
        doctorsInfo.doctorEhrCode
      );
      this.selectedDoctorEduc = education ? education : null;

      this.selectedDoctorHmo = [...this.hmoImageGetter].sort((a, b) =>
        a.hmoDescription.localeCompare(b.hmoDescription)
      );

      if (this.selectedDoctorHmo.length > 0) {
        this.slide = this.selectedDoctorHmo[0].hmoDescription;
      }

      // Create a clean object with only the data you need
      const dialogData = {
        type: "SHOW_DOCTOR_DIALOG",
        payload: {
          // Basic doctor info
          doctorName: this.selectedDoctor.doctorName,
          doctorCode: this.selectedDoctor.doctorCode,
          picture: this.selectedDoctor.picture,
          gender: this.selectedDoctor.gENDER,
          specialization: this.selectedDoctor.specialization,
          room: this.selectedDoctor.rOOM,
          isOnDuty: this.selectedDoctor.isOnDuty,

          // HMO data - extract only what you need
          hmoList: this.selectedDoctorHmo
            ? this.selectedDoctorHmo.map((hmo) => ({
                hmoDescription: hmo.hmoDescription,
                hmoCode: hmo.hmoCode,
              }))
            : [],

          // Schedule data - extract only what you need
          scheduleList: this.selectedDoctorSched
            ? this.selectedDoctorSched.map((sched) => ({
                day: sched.day,
                time: sched.time,
                startTime: sched.startTime,
                endTime: sched.endTime,
              }))
            : [],

          // Education data - extract only what you need
          educationList: this.selectedDoctorEduc
            ? this.selectedDoctorEduc.map((educ) => ({
                degree: educ.degree,
                school: educ.school,
                year: educ.year,
              }))
            : [],

          // Contact data - extract only what you need
          contactList: this.selectedDoctorContact
            ? this.selectedDoctorContact.map((contact) => ({
                type: contact.type,
                value: contact.value,
              }))
            : [],

          slide: this.slide,
        },
      };

      // Send message to parent WordPress page
      window.parent.postMessage(dialogData, "*");
    },
    closeDoctorsDialog() {
      // Send close message to parent WordPress page
      window.parent.postMessage({ type: "CLOSE_DOCTOR_DIALOG" }, "*");

      // Clean up local data
      this.slide = null;
      this.selectedDoctorHmo = null;
      this.doctorsDialog = false;
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

    getCardStyle(index) {
      const totalColumns = this.columns;
      const isLastInRow = (index + 1) % totalColumns === 0;

      const styles = {
        marginLeft: "0px",
        marginRight: "0px",
        marginBottom: "50px",
        width: this.getCardWidth(totalColumns),
        height: "500px",
      };

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

    // Pagination methods
    onPageChange(page) {
      this.currentPage = page;
      // Scroll to top when page changes
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        // Scroll to top when page changes
        this.$nextTick(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
    },
  },
};
</script>
