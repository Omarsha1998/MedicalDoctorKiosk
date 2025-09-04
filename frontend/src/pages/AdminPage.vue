<template>
  <q-layout>
    <q-page-container>
      <div class="mainPageContainer">
        <div style="width: 95%">
          <div class="row q-pt-lg">
            <div class="col-12 q-mb-lg">
              <div class="row">
                <div :class="[$q.screen.gt.sm ? 'col-10' : 'col-12']">
                  <q-input
                    dense
                    v-model="searchText"
                    class="q-mb-sm"
                    input-debounce="0"
                    label="Secretary Name"
                    label-color="blue-10"
                    outlined
                    clearable
                    behavior="menu"
                    fill-input
                    hide-selected
                    use-input
                  />
                </div>
                <div
                  class="text-right"
                  :class="[$q.screen.gt.sm ? 'col-2' : 'col-12']"
                >
                  <q-btn
                    class="bg-blue-10 text-white"
                    :class="[$q.screen.gt.sm ? '' : 'full-width']"
                    :label="
                      $q.screen.gt.md
                        ? 'Add Secretary'
                        : $q.screen.width < 1013
                        ? 'Add Secretary'
                        : ''
                    "
                    icon="add"
                    @click="getDoctors('addNew')"
                  ></q-btn>
                </div>
              </div>
            </div>

            <q-card
              v-for="(secretary, index) in computedSecretary"
              :key="secretary.secretaryCode"
              class="transparent-card flex column justify-between"
              :class="[$q.screen.gt.sm ? 'col-6' : 'col-12']"
              :style="getCardStyle(index)"
            >
              <!-- Secretary Name -->
              <q-card-section
                class="text-yellow-8 text-bold text-center bg-blue-10 text-subtitle1"
              >
                {{ secretary.secretaryName }}
              </q-card-section>

              <!-- Doctors List -->
              <div
                class="text-left text-subtitle2 text-bold q-pt-sm q-pr-sm q-pl-sm q-pb-sm"
              >
                DOCTOR'S:
              </div>

              <div
                v-if="secretary.doctorsAssignment.length === 0"
                class="q-pa-sm text-bold text-subtitle1 text-center"
              >
                No Doctor Assign
              </div>

              <div v-else>
                <div class="column q-pb-xs q-pr-sm q-pl-sm">
                  <div
                    v-for="doctor in secretary.doctorsAssignment.slice(0, 3)"
                    :key="doctor.doctorCode"
                    class="q-mb-xs"
                  >
                    <q-btn
                      outline
                      dense
                      class="full-width bg-white text-primary"
                    >
                      {{ doctor.doctorName }}
                    </q-btn>
                  </div>
                </div>
              </div>

              <q-card-actions class="q-mt-auto">
                <q-btn
                  v-if="secretary.doctorsAssignment.length > 0"
                  push
                  color="positive"
                  label="More Info"
                  class="full-width"
                  @click="showMoreAction(secretary)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <q-dialog v-model="selectedDialog">
          <q-card
            class="bg-grey-2"
            style="min-width: 800px; max-height: 700px"
            :class="['bold-text', $q.screen.name + '-text']"
          >
            <q-card-section
              class="bg-blue-10 row items-center q-pa-md"
              style="position: sticky; top: 0; z-index: 1; min-width: 400px"
            >
              <div class="text-white text-bold">
                Doctors of {{ selectedSecretary }}
              </div>

              <q-space></q-space>
              <q-btn
                class="bg-white text-blue-10"
                icon="close"
                input-debounce="0"
                push
                round
                dense
                @click="closeSelectDia"
              ></q-btn>
            </q-card-section>
            <q-card-section>
              <q-table
                class="custom-scroll"
                :rows="selectedSecretaryItems"
                :columns="selectedItemsCol"
                row-key="doctorCode"
                virtual-scroll
                :virtual-scroll-item-size="5"
                hide-pagination
                :rows-per-page-options="[0]"
                style="max-height: 500px; table-layout: fixed; width: 100%"
              >
                <template v-slot:header>
                  <q-tr class="sticky-thead">
                    <q-th
                      v-for="col in selectedItemsCol"
                      :key="col.secretaryCode"
                      :style="{
                        fontWeight: 'bold',
                      }"
                    >
                      {{ col.label }}
                    </q-th>
                  </q-tr>
                </template>
                <template v-slot:body="props">
                  <q-tr
                    :props="props"
                    :key="props.row.doctorCode"
                    class="hover-row"
                  >
                    <q-td
                      v-for="col in selectedItemsCol"
                      :key="col.doctorCode"
                      :align="col.align"
                    >
                      <template v-if="col.name === 'action'">
                        <q-btn
                          push
                          label="Remove"
                          class="bg-negative text-white"
                          @click="removeDoctor(props.row)"
                        />
                      </template>
                      <template v-else>
                        {{ props.row[col.field] }}
                      </template>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
            <div class="q-pr-md q-pb-sm text-right">
              <q-btn
                class="bg-positive text-white"
                push
                label="Add Doctor"
                @click="getDoctors"
              />
            </div>
          </q-card>
        </q-dialog>

        <q-dialog v-model="addDialog">
          <q-card
            class="bg-grey-2"
            style="min-width: 800px; max-height: 700px"
            :class="['bold-text', $q.screen.name + '-text']"
          >
            <q-card-section
              class="bg-blue-10 row items-center q-pa-md"
              style="position: sticky; top: 0; z-index: 1; min-width: 400px"
            >
              <div class="text-white text-bold">Add Doctor</div>

              <q-space></q-space>
              <q-btn
                class="bg-white text-blue-10"
                icon="close"
                input-debounce="0"
                push
                round
                dense
                @click="closeAddDialog"
              ></q-btn>
            </q-card-section>
            <q-card-section>
              <q-input
                v-if="!addNew"
                v-model.trim="selectedSecretary"
                class="q-mb-xs"
                input-debounce="0"
                label="Secretary Name"
                label-color="blue-10"
                outlined
                clearable
                behavior="menu"
                fill-input
                hide-selected
                use-input
                :readonly="!addNew"
              />

              <q-input
                v-if="addNew"
                v-model="inputtedSecretaryName"
                class="q-mb-xs"
                input-debounce="0"
                label="Secretary Name"
                label-color="blue-10"
                outlined
                clearable
                behavior="menu"
                fill-input
                hide-selected
                use-input
              />

              <q-input
                v-if="addNew"
                v-model="inputtedSecretaryNickname"
                class="q-mb-xs"
                input-debounce="0"
                label="Secretary Nickname"
                label-color="blue-10"
                outlined
                clearable
                behavior="menu"
                fill-input
                hide-selected
                use-input
              />

              <q-input
                v-if="addNew"
                v-model="inputtedSecretaryContactNumber"
                class="q-mb-xs"
                input-debounce="0"
                label="Secretary Contact Number"
                label-color="blue-10"
                outlined
                clearable
                behavior="menu"
                fill-input
                hide-selected
                use-input
              />

              <q-input
                v-if="addNew"
                v-model="inputtedSecretaryCode"
                class="q-mb-xs"
                input-debounce="0"
                label="Secretary Code"
                label-color="blue-10"
                outlined
                clearable
                behavior="menu"
                fill-input
                hide-selected
                use-input
              />

              <q-select
                v-model="selectedDoctors"
                use-input
                input-debounce="0"
                label="Select Doctors"
                label-color="blue-10"
                outlined
                :options="doctorsItem"
                option-label="doctorName"
                option-value="doctorEhrCode"
                @filter="filterFn"
                behavior="menu"
                fill-input
                clearable
                multiple
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey"
                      >No results</q-item-section
                    >
                  </q-item>
                </template>
              </q-select>
            </q-card-section>

            <div class="q-pr-md q-pb-sm text-right">
              <q-btn
                class="bg-positive text-white"
                push
                label="Add Doctor"
                @click="addDoctor"
              />
            </div>
          </q-card>
        </q-dialog>
      </div>
    </q-page-container>
  </q-layout>
</template>
<script>
import { mapGetters } from "vuex";
import helperMethods from "src/helperMethods";
import { QSpinnerIos } from "quasar";

export default {
  data() {
    return {
      searchText: "",
      secretaryItems: [],
      selectedSecretary: null,
      selectedSecretaryCode: null,
      selectedSecretaryItems: [],
      selectedItemsCol: [
        {
          name: "doctorCode",
          label: "Doctor EHR Code",
          align: "center",
          field: "doctorCode",
          width: "350px",
        },
        {
          name: "Name",
          label: "Doctor Name",
          align: "center",
          field: "doctorName",
          width: "650px",
        },
        {
          name: "action",
          label: "Action",
          align: "center",
          field: "",
          width: "100px",
        },
      ],
      selectedDialog: false,
      doctorsItem: [],
      addDialog: false,
      selectedDoctors: null,
      addNew: false,
      inputtedSecretaryName: null,
      inputtedSecretaryCode: null,
      inputtedSecretaryNickname: null,
      inputtedSecretaryContactNumber: null,
    };
  },

  computed: {
    ...mapGetters({
      secretaryWithDoctors: "doctorsModule/getSecretaryWithDoctors",
      doctors: "doctorsModule/getDoctors",
    }),

    columns() {
      if (this.$q.screen.gt.lg) return 5;
      if (this.$q.screen.gt.md) return 4;
      if (this.$q.screen.gt.sm) return 3;
      if (this.$q.screen.gt.xs) return 2;
    },

    computedSecretary() {
      if (Array.isArray(this.secretaryItems)) {
        const query = this.searchText.toLowerCase();
        return this.secretaryItems.filter((row) => {
          return (
            (row.secretaryName &&
              row.secretaryName.toString().toLowerCase().includes(query)) ||
            (row.secretaryCode &&
              row.secretaryCode.toString().toLowerCase().includes(query))
          );
        });
      }
    },
  },

  methods: {
    filterFn(val, update) {
      if (val === "") {
        update(() => {
          this.doctorsItem = this.doctors;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.doctorsItem = this.doctors.filter(
          (option) =>
            option.doctorName.toLowerCase().indexOf(needle) > -1 ||
            option.doctorEhrCode.toLowerCase().indexOf(needle) > -1
        );
      });
    },

    async getAllSecretaryWithDoctors() {
      try {
        await this.$store.dispatch("doctorsModule/getAllSecretaryWithDoctors");
        this.secretaryItems = this.secretaryWithDoctors;
      } catch (error) {
        console.error(error);
      }
    },

    getCardStyle(index) {
      return helperMethods.getCardStyle(index, this.columns);
    },

    calculateFontSize(text) {
      return helperMethods.calculateFontSize(text);
    },

    showMoreAction(items) {
      this.selectedSecretary = items.secretaryName;
      this.selectedSecretaryCode = items.secretaryCode;
      this.selectedSecretaryItems = items.doctorsAssignment;
      this.selectedDialog = true;
    },

    closeSelectDia() {
      this.selectedSecretary = null;
      this.selectedSecretaryCode = null;
      this.selectedDialog = false;
    },

    async removeDoctor(item) {
      try {
        helperMethods.disablePointerEvents();
        helperMethods.delay(500);
        const data = {
          id: item.id,
          doctorCode: item.doctorCode,
          secretaryCode: this.selectedSecretaryCode,
        };
        await this.$store.dispatch(
          "doctorsModule/removeDoctorInSecretary",
          data
        );
        this.$q.notify({
          color: "positive",
          position: "center",
          message: `Doctor assignment remove successfully`,
          icon: "check",
          iconColor: "white",
          timeout: 1500,
          progress: true,
        });
        this.selectedSecretary = null;
        this.selectedSecretaryCode = null;
        await this.getAllSecretaryWithDoctors();
        this.selectedDialog = false;
        helperMethods.enablePointerEvents();
      } catch (error) {
        helperMethods.enablePointerEvents();
        this.$q.notify({
          color: "negative",
          position: "center",
          message: "Error in removing doctor assignment",
          icon: "report_problem",
          iconColor: "white",
          timeout: 1500,
          progress: true,
        });
        console.error(error);
      }
    },

    async getDoctors(data) {
      try {
        if (data === "addNew") {
          this.addNew = true;
        }
        await this.$store.dispatch("doctorsModule/getDoctors");
        this.doctorsItem = this.doctors;
        this.addDialog = true;
      } catch (error) {
        console.error(error);
      }
    },

    closeAddDialog() {
      if (this.addNew === true) {
        this.inputtedSecretaryCode = null;
        this.inputtedSecretaryName = null;
        this.addNew = false;
      }
      this.selectedDoctors = null;
      this.addDialog = false;
    },

    async addDoctor() {
      if (!this.selectedDoctors) {
        this.$q.notify({
          color: "negative",
          position: "center",
          message: "Please select a doctor to assign",
          icon: "report_problem",
          iconColor: "white",
          timeout: 1000,
          progress: true,
        });
        return;
      }

      if (this.addNew === true) {
        if (
          !this.inputtedSecretaryName ||
          !this.inputtedSecretaryCode ||
          !this.inputtedSecretaryNickname ||
          !this.inputtedSecretaryContactNumber
        ) {
          this.$q.notify({
            color: "negative",
            position: "center",
            message: "Please fill in all secretary details",
            icon: "report_problem",
            iconColor: "white",
            timeout: 1000,
            progress: true,
          });
          return;
        }
      }
      try {
        helperMethods.disablePointerEvents;
        helperMethods.delay(500);

        let data;

        if (this.addNew === true) {
          data = {
            doctorCodes: this.selectedDoctors,
            secretaryName: this.inputtedSecretaryName,
            secretaryCode: this.inputtedSecretaryCode,
            secretaryNickname: this.inputtedSecretaryNickname,
            secretaryContactNumber: this.inputtedSecretaryContactNumber,
            addNew: this.addNew,
          };
        } else {
          data = {
            doctorCodes: this.selectedDoctors,
            secretaryName: this.selectedSecretary,
            secretaryCode: this.selectedSecretaryCode,
            addNew: this.addNew,
          };
        }
        this.$q.loading.show({
          spinner: QSpinnerIos,
          message: "Adding new secretary",
          messageColor: "primary",
          backgroundColor: "grey-1",
          spinnerColor: "primary",
          customClass: "custom-loading-style",
          spinnerSize: "7em",
        });

        await this.$store.dispatch("doctorsModule/addDoctorAssignment", data);
        await this.getAllSecretaryWithDoctors();
        this.selectedDialog = false;
        this.$q.loading.hide();
        this.$q.notify({
          color: "positive",
          position: "center",
          message: `Doctor assignment add successfully`,
          icon: "check",
          iconColor: "white",
          timeout: 1500,
          progress: true,
        });
        helperMethods.enablePointerEvents();
        this.selectedSecretaryCode = null;
        this.selectedDoctors = null;
        this.inputtedSecretaryName = null;
        this.inputtedSecretaryCode = null;
        this.inputtedSecretaryNickname = null;
        this.inputtedSecretaryContactNumber = null;
        this.addDialog = false;
      } catch (error) {
        this.$q.loading.hide();
        helperMethods.enablePointerEvents();
        if (error.status === 409) {
          this.$q.notify({
            color: "negative",
            position: "center",
            message: `${error.response.data.body}`,
            icon: "report_problem",
            iconColor: "white",
            timeout: 1500,
            progress: true,
          });
          return;
        }
        this.$q.notify({
          color: "negative",
          position: "center",
          message: "Error in adding doctor assignment",
          icon: "report_problem",
          iconColor: "white",
          timeout: 1500,
          progress: true,
        });
        console.error(error);
      }
    },
  },

  created() {
    this.getAllSecretaryWithDoctors();
  },
};
</script>
