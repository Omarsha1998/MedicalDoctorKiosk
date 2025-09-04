<template>
  <q-footer class="row bg-transparent q-pa-none">
    <!-- Main Content (col-11) -->
    <div v-if="$q.screen.lt.md" class="col-12 text-right">
      <a
        class="q-mr-md"
        href="https://privacy.gov.ph/npc-privacy-policy-2/"
        target="_blank"
      >
        <img
          class="image-npc-logo"
          src="../assets/images/NPC.png"
          alt="NPC Logo"
          style="height: 75px"
        />
      </a>
    </div>
    <div
      class="col-11 row items-center justify-center q-pr-none position-relative"
      :class="$q.screen.gt.sm ? 'col-11' : 'col-12'"
    >
      <!-- Left Scroll Button -->
      <q-btn
        v-if="canScroll && !isAtStart"
        round
        icon="chevron_left"
        color="blue-10"
        text-color="yellow-8"
        class="scrollBtn scrollBtn-left"
        @mousedown="startScroll('left')"
        @mouseup="stopScroll"
        @mouseleave="stopScroll"
      />

      <!-- Scrollable Department List -->
      <div
        v-if="$route.path === '/doctors'"
        ref="scrollArea"
        class="bg-white headerFooterContainer"
        style="
          height: 130px;
          display: flex;
          justify-content: start;
          align-items: center;
          overflow-x: auto;
          scroll-behavior: smooth;
          flex-grow: 1;
          border-top: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
        "
        @scroll="updateScrollState"
      >
        <div
          ref="scrollContent"
          class="q-pa-md"
          style="
            display: grid;
            grid-template-columns: auto;
            grid-template-rows: 1fr 1fr;
            gap: 10px;
            grid-auto-flow: column;
          "
        >
          <q-btn
            v-for="(department, index) in sortedDepartments"
            :key="department.value"
            :label="department.label"
            flat
            color="primary"
            class="text-capitalize text-blue-10 bg-white footer-btn"
            style="white-space: nowrap; min-width: auto; position: relative"
            :style="{ gridRow: index % 2 === 0 ? '1' : '2' }"
            @click="onDepartmentClick(department)"
          >
            <q-badge
              v-if="departmentDoctorCounts[department.value]"
              color="positive"
              text-color="white"
              class="badge"
              :style="{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                fontSize: '12px',
                minWidth: '20px',
                height: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '50%',
              }"
            >
              {{ departmentDoctorCounts[department.value] }}
            </q-badge>
          </q-btn>
        </div>
      </div>

      <!-- Right Scroll Button -->
      <q-btn
        v-if="canScroll && !isAtEnd"
        round
        icon="chevron_right"
        color="blue-10"
        text-color="yellow-8"
        class="scrollBtn scrollBtn-right"
        @mousedown="startScroll('right')"
        @mouseup="stopScroll"
        @mouseleave="stopScroll"
      />
    </div>

    <!-- NPC Logo (col-1) -->
    <div
      v-if="$q.screen.gt.sm"
      class="col-1 flex flex-center q-pl-none npcContainer bg-white"
    >
      <a href="https://privacy.gov.ph/npc-privacy-policy-2/" target="_blank">
        <img
          class="image-npc-logo"
          src="../assets/images/NPC.png"
          alt="NPC Logo"
          style="height: 75px"
        />
      </a>
    </div>
  </q-footer>
</template>

<script>
import { mapGetters } from "vuex";
// import { initSSE, listenEvent } from "src/serverSideEvent";

export default {
  data() {
    return {
      isAtStart: true,
      isAtEnd: false,
      canScroll: false,
      scrollInterval: null,
      selectedDepartment: null,
      idleTimer: null,
      idleThreshold: 120 * 1000,
    };
  },

  computed: {
    ...mapGetters({
      specialization: "doctorsModule/getSpecialization",
      departments: "doctorsModule/getDepartments",
      getDoctorsCounts: "doctorsModule/getDoctorsCounts",
      allDoctors: "doctorsModule/getDoctors",
    }),

    departmentDoctorCounts() {
      const counts = {};

      for (const department of this.departments) {
        counts[department.value] = 0;
      }

      const doctors = Array.isArray(this.allDoctors) ? this.allDoctors : [];

      for (const doctor of doctors) {
        const dept = doctor.dEPARTMENT;
        if (counts.hasOwnProperty(dept) && doctor.isOnDuty === 1) {
          counts[dept]++;
        }
      }

      return counts;
    },

    sortedDepartments() {
      return [...this.departments].sort((a, b) => {
        const countA = this.departmentDoctorCounts[a.value] || 0;
        const countB = this.departmentDoctorCounts[b.value] || 0;

        if (countA !== countB) {
          return countB - countA;
        }

        return a.label.localeCompare(b.label);
      });
    },
  },

  methods: {
    async getDoctorsStatusCount() {
      try {
        await this.$store.dispatch("doctorsModule/getDoctorsStatusCount");
      } catch (error) {
        this.loading = false;
        console.error(error);
      }
    },

    onDepartmentClick(department) {
      this.$emit("data-emitted", department);
    },

    updateScrollState() {
      this.$nextTick(() => {
        const scrollArea = this.$refs.scrollArea;
        if (!scrollArea) return;

        const { scrollLeft, clientWidth, scrollWidth } = scrollArea;

        this.isAtStart = scrollLeft <= 0;
        this.isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;
        this.canScroll = scrollWidth > clientWidth;
      });
    },

    scrollLeft() {
      const scrollArea = this.$refs.scrollArea;
      if (scrollArea) {
        const newScrollLeft = scrollArea.scrollLeft - 100;
        scrollArea.scrollTo({ left: newScrollLeft, behavior: "smooth" });
      }
    },

    scrollRight() {
      const scrollArea = this.$refs.scrollArea;
      if (scrollArea) {
        const newScrollLeft = scrollArea.scrollLeft + 100;
        scrollArea.scrollTo({ left: newScrollLeft, behavior: "smooth" });
      }
    },

    startScroll(direction) {
      this.stopScroll();

      const scrollArea = this.$refs.scrollArea;
      if (!scrollArea) return;

      this.scrollInterval = setInterval(() => {
        if (direction === "left") {
          this.scrollLeft();
        } else {
          this.scrollRight();
        }
      }, 100);
    },

    stopScroll() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }
    },

    async handleUserActivity() {
      if (this.idleTimer) {
        clearTimeout(this.idleTimer);
        this.idleTimer = null;
      }

      this.idleTimer = setTimeout(async () => {
        await this.getDoctorsStatusCount();

        this.handleUserActivity();
      }, this.idleThreshold);
    },
  },

  created() {
    this.getDoctorsStatusCount();
  },

  mounted() {
    this.$nextTick(() => {
      this.updateScrollState();
    });

    window.addEventListener("resize", this.updateScrollState);
    this.$refs.scrollArea?.addEventListener("scroll", this.updateScrollState);

    // initSSE();
    // listenEvent(async (message) => {
    //   if (message === "doctorStatusUpdated") {
    //     await this.getDoctorsStatusCount();
    //   }
    // });

    document.addEventListener("mousemove", this.handleUserActivity);
    document.addEventListener("mousedown", this.handleUserActivity);
    document.addEventListener("keydown", this.handleUserActivity);
    document.addEventListener("touchstart", this.handleUserActivity);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateScrollState);
    this.$refs.scrollArea?.removeEventListener(
      "scroll",
      this.updateScrollState
    );
    this.stopScroll();

    clearTimeout(this.idleTimer);
    document.removeEventListener("mousemove", this.handleUserActivity);
    document.removeEventListener("mousedown", this.handleUserActivity);
    document.removeEventListener("keydown", this.handleUserActivity);
    document.removeEventListener("touchstart", this.handleUserActivity);
  },
};
</script>

<style>
.headerFooterContainer {
  overflow-y: hidden;
  scroll-behavior: smooth;
  outline: none; /* Remove full outline */
  box-shadow: 0 -1.5px 0 black, 0 1.5px 0 black;
}

.npcContainer {
  outline: none; /* Remove full outline */
  box-shadow: 0 -1.5px 0 black, 0 1.5px 0 black;
}

.position-relative {
  position: relative;
}

.scrollBtn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background-color: white;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  user-select: none;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.scrollBtn-left {
  left: 0; /* Attach to the left edge of col-11 */
}

.scrollBtn-right {
  right: 0; /* Attach to the right edge of col-11 */
}
</style>
