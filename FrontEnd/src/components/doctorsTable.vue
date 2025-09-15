<template>
  <Loader :isLoading="loader" :login="false" />
  <q-select
    v-if="!secretaryView && !doctorConfig"
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
  <q-table
    v-if="!gridView"
    class="custom-scroll"
    :rows="computedDoctors"
    :columns="doctorsColumn"
    row-key="doctorCode"
    virtual-scroll
    :virtual-scroll-item-size="11"
    hide-pagination
    :rows-per-page-options="[0]"
    style="table-layout: fixed; width: 100%"
  >
    <template v-slot:header>
      <q-tr class="sticky-thead bg-blue-10">
        <q-th
          v-for="col in doctorsColumn"
          :key="col.name"
          :style="{
            width: col.width,
            fontSize: '17px',
          }"
          class="text-center text-yellow-8"
        >
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>
    <template v-slot:top>
      <q-input
        class="bg-grey-4 full-width"
        v-model="searchText"
        placeholder="Search"
        outlined
        dense
        standout
        clearable
        :class="[$q.screen.name + '-text2']"
        input-style="color: #1565c0;"
        @clear="this.searchText = ''"
      />
    </template>

    <template v-slot:body="props">
      <q-tr :props="props" :key="props.row.doctorCode" class="hover-row">
        <q-td
          v-for="(col, index) in doctorsColumn"
          :key="col.name"
          :style="{
            width: col.width,
            borderBottom: '1px solid #ccc',
            borderRight: index > 0 ? '1px solid #ccc' : 'none',
          }"
          class="text-center"
          @click="selectedDocDialog(props.row)"
        >
          <template v-if="col.name === 'status'">
            <div class="centered-container">
              <div
                v-if="secretaryView"
                class="toggle-container"
                :class="{ active: props.row.isOnDuty }"
                @click.stop="toggleStatusSecretary(props.row)"
              >
                <span
                  :class="props.row.isOnDuty ? 'toggle-text' : 'toggle-text'"
                >
                  {{ props.row.isOnDuty ? "In Clinic" : "Out" }}
                </span>
                <div
                  class="toggle-ball"
                  :class="{ 'active-ball': props.row.isOnDuty }"
                ></div>
              </div>
              <div
                v-if="doctorConfig"
                @click.stop="selectedDocDialog(props.row, 'update')"
              >
                <q-btn
                  class="text-yellow-8"
                  color="blue-10"
                  push
                  label="Update / Edit"
                />
              </div>
              <div v-else>
                <div
                  v-if="props.row.isOnDuty && !secretaryView"
                  class="q-pa-xs flex justify-center items-center bg-green-1 text-green-10 text-h6"
                  style="
                    border-radius: 10%;
                    min-width: 80px;
                    padding: 8px 12px;
                    white-space: nowrap;
                  "
                >
                  IN CLINIC
                </div>
              </div>
            </div>
          </template>

          <template
            v-else-if="
              col.name === 'department' ||
              col.name === 'specialties' ||
              col.name === 'room'
            "
          >
            <div class="text-wrap">
              {{ props.row[col.field]?.trim() || "-" }}
            </div>
          </template>
          <template v-else-if="col.name === 'doctorName'">
            <div class="text-left q-ml-sm">
              <div class="text-bold text-blue-10 text-left text-subtitle1">
                {{ props.row[col.field]?.split(",")[0]?.trim() || "" }}
              </div>

              <div>
                {{
                  props.row[col.field]?.split(",").slice(1).join(",").trim() ||
                  "-"
                }}
                <span
                  v-if="secretaryView && props.row.doctorEhrCode"
                  class="text-bold"
                >
                  | {{ props.row.doctorEhrCode }}
                </span>
              </div>
            </div>
          </template>

          <template v-else-if="col.name === 'schedule'">
            <div v-if="!secretaryView">
              <div class="text-wrap">
                <div
                  v-for="(sched, idx) in formatSchedule(
                    props.row.doctorSchedule
                  )"
                  :key="idx"
                >
                  {{ sched }}
                </div>
              </div>
            </div>
            <div v-else>
              <div v-if="props.row.secName1">
                {{ props.row.sKED || "-" }}
              </div>
              <div>
                Time-In:
                <span class="text-subtitle2 text-bold">{{
                  formatTime(props.row.dateTimeIn)
                }}</span>
              </div>
              <div>
                Time-Out:
                <span class="text-subtitle2 text-bold">{{
                  formatTime(props.row.dateTimeOut)
                }}</span>
              </div>
            </div>
          </template>
          <template v-else-if="col.name === 'secretary'">
            <div v-if="props.row.secName1 || props.row.secName2">
              <div v-if="props.row.secName1">
                {{ props.row.secName1 || "-" }}
              </div>
              <div class="text-subtitle1 text-bold" v-if="props.row.secMPN1">
                {{ props.row.secMPN1 || "-" }}
              </div>
              <div v-if="props.row.secName2">
                {{ props.row.secName2 || "-" }}
              </div>
              <div class="text-subtitle1 text-bold" v-if="props.row.secMPN2">
                {{ props.row.secMPN2 || "-" }}
              </div>
            </div>
            <div v-else class="q-mt-sm">-</div>
          </template>
          <template v-else>
            {{ props.row[col.field] }}
          </template>
        </q-td>
      </q-tr>
    </template>

    <template v-slot:no-data="{ message }">
      <div class="full-width row flex-center text-black text-subtitle2">
        <div>
          <span class="text-black text-subtitle2">
            {{ message }}
          </span>
          <q-icon
            class="text-red"
            size="2em"
            name="sentiment_dissatisfied"
          ></q-icon>
        </div>
      </div>
    </template>
  </q-table>
  <div v-if="gridView" class="row q-mt-md" ref="doctorsContainer">
    <q-card
      v-for="(doctor, index) in displayedDoctors"
      :key="doctor.cODE"
      :class="
        ([$q.screen.gt.sm ? 'col-4' : 'col-12'], 'transparent-card-doctors')
      "
      :style="getCardStyle(index)"
    >
      <q-card-section class="q-pa-none">
        <div
          class="img-wrapper clickable"
          @click="selectedDocDialog(doctor)"
          style="height: 500px; position: relative; overflow: hidden"
        >
          <!-- <q-img
            :src="
              doctor.picture
                ? doctor.picture
                : doctor.gENDER === 'M'
                ? docMale
                : docFemale
            "
            class="zoomable-img"
            style="height: 100%; width: 100%; object-fit: cover; display: block"
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
                :class="[$q.screen.name + '-textDoctor']"
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
          </q-img> -->
          <q-img
            :src="
              doctor.picture
                ? doctor.picture
                : doctor.gENDER === 'M'
                ? docMale
                : docFemale
            "
            :ratio="1"
            class="zoomable-img"
            style="height: 100%; width: 100%; object-fit: cover; display: block"
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
                :class="[$q.screen.name + '-textDoctor']"
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
      <q-card-section v-if="secretaryView">
        <div class="row justify-center items-center">
          <div
            class="toggle-container"
            :class="{ active: doctor.isOnDuty }"
            @click.stop="toggleStatusSecretary(doctor)"
          >
            <span :class="doctor.isOnDuty ? 'toggle-text' : 'toggle-text'">
              {{ doctor.isOnDuty ? "In Clinic" : "Out" }}
            </span>
            <div
              class="toggle-ball"
              :class="{ 'active-ball': doctor.isOnDuty }"
            ></div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <doctorDia
    v-if="doctorsDialog"
    :doctorConfig="this.updateDialog"
    :dataDoctor="selectedDoctor"
    :dataDoctorHmo="selectedDoctorHmo"
    :dataDoctorSchedule="selectedDoctorSched"
    :dataDoctorEducation="selectedDoctorEduc"
    :dataDoctorSecretaries="selectedDoctorSecretaries"
    :hmoOptions="hmos"
    :consultatioTypeOptions="consultOption"
    :dataDoctorContacts="selectedDoctorContact"
    :deptSpecOptions="deptSpecOptions"
    :slideValue="this.slide"
    @close="closeDoctorsDialog"
    @statusUpdated="closeDoctorsDialog"
  />
</template>

<script>
import { mapGetters } from "vuex";
import doctorDia from "src/components/selectedDoctorDialog.vue";
import helperMethods from "src/helperMethods";
import Loader from "./Loader.vue";
import docMale from "assets/images/doctorMale.png";
import docFemale from "assets/images/doctorFemale.png";

// import { emitEvent } from "src/serverSideEvent";

export default {
  emits: ["statusUpdated"],
  props: {
    doctors: Object,
    secretaryView: Boolean,
    hmosOptions: Object,
    loading: Boolean,
    gridView: Boolean,
    doctorConfig: Boolean,
  },
  data() {
    return {
      doctorsColumn: [
        {
          name: "status",
          label: `${this.doctorConfig ? "Action" : "Status"}`,
          align: "center",
          field: "",
          width: "80px",
        },
        {
          name: "doctorName",
          label: "Doctor",
          align: "left",
          field: "doctorName",
          width: "150px",
        },
        {
          name: "room",
          label: "Room",
          align: "center",
          field: "rOOM",
          width: "150px",
        },
        {
          name: "department",
          label: "Specialty",
          align: "center",
          field: "departmentName",
          width: "200px",
        },
        {
          name: "specialties",
          label: "Subspecialties",
          align: "center",
          field: "specialties",
          width: "200px",
        },
        {
          name: "schedule",
          label: "Schedule",
          align: "center",
          field: "",
          width: "300px",
        },
        {
          name: "secretary",
          label: "Secretary",
          align: "center",
          field: "secretary",
          width: "50px",
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
      consultOption: [],
      deptSpecOptions: [],
      displayedCount: 12,
      itemsPerLoad: 12,
      isLoadingMore: false,
      scrollThreshold: 350,
      hmos: null,
      imageSrc: null,
      updateDialog: false,
      selectedDoctorSecretaries: [],
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

      return this.doctors
        .filter((doctor) => {
          const matchesSearch = doctor.doctorName
            ?.toString()
            .toLowerCase()
            .includes(query);

          if (!matchesSearch) return false;

          if (this.status === "All") return true;

          const isInClinic = doctor.isOnDuty === 1;
          return this.status === "In Clinic" ? isInClinic : !isInClinic;
        })
        .sort((a, b) => {
          if (this.doctorConfig === false) {
            const aIsOnDuty = a.isOnDuty === 1 || a.isOnDuty === true;
            const bIsOnDuty = b.isOnDuty === 1 || b.isOnDuty === true;

            if (aIsOnDuty !== bIsOnDuty) {
              return bIsOnDuty - aIsOnDuty;
            }
            const nameA = (a.doctorName || "").toLowerCase();
            const nameB = (b.doctorName || "").toLowerCase();

            return nameA.localeCompare(nameB);
          }
        });
    },

    columns() {
      // if (this.$q.screen.gt.md) return 4;
      if (this.$q.screen.gt.sm) return 3;
      if (this.$q.screen.gt.xs) return 2;
    },

    displayedDoctors() {
      return this.computedDoctors.slice(0, this.displayedCount);
    },

    hasReachedEnd() {
      return this.displayedCount >= this.computedDoctors.length;
    },
  },

  methods: {
    handleRowClick(row) {
      if (!this.doctorConfig) {
        this.selectedDocDialog(row);
      }
    },

    formatTime(dateTimeString) {
      if (!dateTimeString) return "-";

      const parts = dateTimeString.split(" ");
      return parts.slice(-2).join("");
    },

    completeWeekSchedule(schedule) {
      const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

      const scheduleMap = {};

      for (const sched of schedule) {
        scheduleMap[sched.day] = sched;

        sched.timeFrom = this.formatTimeForInput(sched.timeFrom);
        sched.timeTo = this.formatTimeForInput(sched.timeTo);
      }

      return weekDays.map((day, index) => {
        const existingSchedule = scheduleMap[day];

        if (existingSchedule) {
          return existingSchedule;
        } else {
          return {
            id: `New, ${day}`,
            doctorCode: schedule[0]?.doctorCode || null,
            day: day,
            timeFrom: null,
            timeTo: null,
            remarks: null,
            consultationTypeDesc: null,
            newSched: true,
            active: false,
          };
        }
      });
    },

    formatTimeForInput(isoString) {
      if (!isoString) return "";

      const date = new Date(isoString);

      if (isNaN(date.getTime())) return "";

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${hours}:${minutes}`;
    },

    async selectedDocDialog(doctorsInfo, type) {
      if (type === "update") {
        this.updateDialog = true;
      }

      this.selectedDoctor = JSON.parse(JSON.stringify(doctorsInfo));

      await this.$store.dispatch(
        "doctorsModule/getDoctorHmo",
        this.selectedDoctor.doctorCode
      );

      const contact = await this.$store.dispatch(
        "doctorsModule/doctorContacts",
        doctorsInfo.doctorEhrCode
      );

      this.selectedDoctorContact = contact ? contact[0] : [];

      const sched = await this.$store.dispatch(
        "doctorsModule/doctorSchedule",
        doctorsInfo.doctorEhrCode
      );

      this.selectedDoctorSched = this.completeWeekSchedule(sched);

      const education = await this.$store.dispatch(
        "doctorsModule/doctorEducation",
        doctorsInfo.doctorEhrCode
      );

      this.selectedDoctorEduc = education ? education : [];

      const secretaries = await this.$store.dispatch(
        "doctorsModule/doctorSecretaries",
        doctorsInfo.doctorEhrCode
      );

      this.selectedDoctorSecretaries = secretaries ? secretaries : [];

      if (!this.gridView) {
        const ehrCode = this.selectedDoctor.doctorEhrCode ?? null;
        // const code = this.selectedDoctor.doctorCode ?? null;

        const image = await this.getImage(ehrCode, null);
        this.selectedDoctor.picture = image;

        const consult = await this.$store.dispatch(
          "doctorsModule/consultationOption"
        );

        this.consultOption = consult;

        const deptSpec = await this.$store.dispatch(
          "doctorsModule/deptSpecOption"
        );

        this.hmos = this.hmosOptions;

        this.deptSpecOptions = deptSpec;
      }

      this.selectedDoctorHmo = [...this.hmoImageGetter].sort((a, b) =>
        a.hmoDescription.localeCompare(b.hmoDescription)
      );

      if (this.selectedDoctorHmo.length > 0) {
        this.slide = this.selectedDoctorHmo[0].hmoDescription;
      }

      this.doctorsDialog = true;
    },

    closeDoctorsDialog(config) {
      this.slide = null;
      this.selectedDoctorHmo = null;
      this.doctorsDialog = false;
      this.updateDialog = false;

      if (config) {
        this.$emit("statusUpdated");
      }
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

    getCardStyle(index) {
      const totalColumns = this.columns;
      const isFirstInRow = index % totalColumns === 0;
      const isLastInRow = (index + 1) % totalColumns === 0;

      const styles = {
        marginLeft: "0px",
        marginRight: "0px",
        marginBottom: "50px",
        width: this.getCardWidth(totalColumns),
        height: "auto",
      };
      // if (totalColumns === 4) {
      //   if (!isLastInRow) {
      //     styles.marginRight = "30px";
      //   }
      // }

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
        // case 4:
        //   return "calc(25% - 25px)";
        case 3:
          return "calc(33.33% - 30px)";
        case 2:
          return "calc(50% - 30px)";
        default:
          return "100%";
      }
    },

    handleScroll() {
      if (this.isLoadingMore || this.hasReachedEnd) return;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

      if (distanceFromBottom < this.scrollThreshold) {
        this.loadMoreDoctors();
      }
    },

    async loadMoreDoctors() {
      if (this.isLoadingMore || this.hasReachedEnd) return;

      this.isLoadingMore = true;

      await new Promise((resolve) => setTimeout(resolve, 650));

      const previousCountDoctors = this.displayedCount;
      const newCountDoctors = Math.min(
        this.displayedCount + this.itemsPerLoad,
        this.computedDoctors.length
      );

      this.displayedCount = newCountDoctors;
      this.isLoadingMore = false;
    },

    async getImage(doctorEhrCode, doctorCode) {
      const doctorCodes = {
        ehrCode: doctorEhrCode,
        code: doctorCode,
      };
      return await this.$store.dispatch("doctorsModule/getImage", doctorCodes);
    },

    formatSchedule(rawSchedule) {
      if (!rawSchedule) return [];

      const hasDays = /(MON|TUE|WED|THU|FRI|SAT|SUN)/i.test(rawSchedule);
      if (!hasDays) {
        return [rawSchedule.trim()];
      }

      const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const dayMap = {
        MON: "Mon",
        TUE: "Tue",
        WED: "Wed",
        THU: "Thu",
        FRI: "Fri",
        SAT: "Sat",
        SUN: "Sun",
      };

      const entries = rawSchedule
        .split(",")
        .map((s) => s.trim())
        .map((entry) => {
          const [day, ...rest] = entry.split(" - ");
          return {
            day: dayMap[day.trim().toUpperCase()] || day.trim(),
            value: rest.join(" - ").trim(),
          };
        });

      const grouped = [];
      let currentGroup = null;

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        if (
          currentGroup &&
          currentGroup.value === entry.value &&
          dayOrder.indexOf(entry.day) ===
            dayOrder.indexOf(currentGroup.endDay) + 1
        ) {
          currentGroup.endDay = entry.day;
        } else {
          if (currentGroup) grouped.push(currentGroup);
          currentGroup = {
            startDay: entry.day,
            endDay: entry.day,
            value: entry.value,
          };
        }
      }

      if (currentGroup) grouped.push(currentGroup);

      return grouped.map((group) => {
        const dayPart =
          group.startDay === group.endDay
            ? group.startDay
            : `${group.startDay} - ${group.endDay}`;
        return `${dayPart} - ${group.value}`;
      });
    },
  },

  async mounted() {
    if (this.gridView) {
      window.addEventListener("scroll", this.handleScroll);
    }
  },

  beforeUnmount() {
    if (this.gridView) {
      window.removeEventListener("scroll", this.handleScroll);
    }
  },

  watch: {
    displayedDoctors: {
      async handler(newVal) {
        if (this.gridView) {
          for (const doctor of newVal) {
            if (!doctor.picture) {
              const ehrCode = doctor.doctorEhrCode
                ? doctor.doctorEhrCode
                : null;
              const image = await this.getImage(ehrCode, null);
              doctor.picture = image;
            }
          }
        }
      },
      immediate: true,
    },
    searchText() {
      this.displayedCount = 12;
      this.isLoadingMore = false;
    },
    status() {
      this.displayedCount = 12;
      this.isLoadingMore = false;
    },
    doctors() {
      this.displayedCount = 12;
      this.isLoadingMore = false;
    },
  },
};
</script>
