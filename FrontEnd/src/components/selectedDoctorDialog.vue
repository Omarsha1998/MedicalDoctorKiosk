<template>
  <q-dialog v-model="dialogVisible" persistent class="backdrop-blur">
    <q-card
      v-if="doctorConfig"
      class="bg-grey-2"
      style="
        border-radius: 10px;
        width: 100%;
        max-width: 1500px;
        position: relative;
      "
      :class="['bold-text', $q.screen.name + '-text']"
    >
      <div
        class="row items-center SecHeaderColor bg-grey-2 q-pl-sm q-pt-sm q-pb-sm"
        style="position: sticky; top: 0; z-index: 10"
      >
        <q-icon
          class="q-mr-sm"
          name="keyboard_backspace"
          style="cursor: pointer"
          @click="$emit('close')"
        />
        <p
          class="q-mb-none text-subtitle1"
          style="cursor: pointer; font-size: 20px"
          @click="$emit('close', dataConfig)"
        >
          Back to Doctor's List
        </p>
      </div>

      <!-- Next content section -->
      <q-card-section class="row q-pl-md q-pr-md q-pb-md">
        <div class="row">
          <div class="text-blue-10 text-bold col-12 text-h5 q-mb-sm">
            Information
          </div>
          <div class="q-pl-md q-pr-md q-mb-md">
            <div class="row q-col-gutter-xs">
              <q-input
                v-model="selectedDoctor.doctorName"
                label="Full Name"
                label-color="blue-10"
                outlined
                readonly
                class="blue-outline col-12"
              />

              <q-input
                v-model="selectedDoctor.lastName"
                :disable="!informationUpdate"
                label="Last Name"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorLastName')
                "
              />

              <q-input
                v-model="selectedDoctor.firstName"
                :disable="!informationUpdate"
                label="First Name"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorFirstName')
                "
              />

              <q-input
                v-model="selectedDoctor.middleName"
                :disable="!informationUpdate"
                label="Middle Name"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorMiddleName')
                "
              />

              <q-input
                v-model="selectedDoctor.suffix"
                :disable="!informationUpdate"
                label="Suffix"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorSuffix')
                "
              />

              <q-input
                v-model="selectedDoctor.rOOM"
                :disable="!informationUpdate && !contactUpdate"
                label="Room"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorRoom')
                "
              />

              <q-input
                v-model="selectedDoctor.doctorMobile"
                :disable="!informationUpdate && !contactUpdate"
                label="Mobile Number"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorMobile')
                "
              />

              <q-input
                v-model="selectedDoctor.lIC"
                :disable="!informationUpdate"
                label="License Number"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorLicense')
                "
              />

              <q-input
                outlined
                v-model="selectedDoctor.licenseExpirationDate"
                :disable="!informationUpdate"
                label="License Expiration Date"
                label-color="blue-10"
                @click="showPopup('licensePopUp')"
                style="margin-bottom: 5px"
                class="blue-outline col-12 col-sm-3"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="licensePopUp" cover>
                      <div class="q-date-container">
                        <q-date
                          v-model="selectedDoctor.licenseExpirationDate"
                          mask="MM/DD/YYYY"
                          @update:model-value="
                            (value) =>
                              onSelectedChange(
                                selectedDoctor,
                                value,
                                'licenseExpiration'
                              )
                          "
                        />
                        <q-btn
                          push
                          icon="close"
                          class="bg-white absolute-top-right"
                          round
                          padding="xs"
                          @click="hidePopup('licensePopUp')"
                          style="margin: 10px"
                        />
                      </div>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <!-- {{ selectedDoctor.licenseExpirationDate }} -->
              <!--
              <q-input
                v-model="selectedDoctor.licenseExpirationDate"
                label="License Expiration Date"
                label-color="blue-10"
                outlined
                clearable
                :disable="!licenseUpdate"
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorLicense')
                "
              /> -->

              <q-input
                v-model="selectedDoctor.doctorMobile2"
                :disable="!informationUpdate && !contactUpdate"
                label="Mobile Number 2"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorMobile2')
                "
              />

              <!-- <q-input
                v-model="selectedDoctorContact.value"
                label="Direct Line"
                label-color="blue-10"
                outlined
                clearable
                :disable="!informationUpdate"
                class="blue-outline col-12 col-sm-4"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'uermContact')
                "
              /> -->

              <q-input
                v-model="selectedDoctorContact.value"
                :disable="!informationUpdate && !contactUpdate"
                label="Direct Line"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'uermContact')
                "
              />

              <q-input
                v-model="selectedDoctor.pHIC"
                :disable="!informationUpdate"
                label="Philhealth Number"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorPhilhealth')
                "
              />

              <q-input
                outlined
                v-model="selectedDoctor.philHealthExpirationDate"
                :disable="!informationUpdate"
                label="PhilHealth Expiration Date"
                label-color="blue-10"
                @click="showPopup('philHealthPopUp')"
                style="margin-bottom: 5px"
                class="blue-outline col-12 col-sm-3"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="philHealthPopUp" cover>
                      <div class="q-date-container">
                        <q-date
                          v-model="selectedDoctor.philHealthExpirationDate"
                          mask="MM/DD/YYYY"
                          @update:model-value="
                            (value) =>
                              onSelectedChange(
                                selectedDoctor,
                                value,
                                'philhealthExpiration'
                              )
                          "
                        />
                        <q-btn
                          push
                          icon="close"
                          class="bg-white absolute-top-right"
                          round
                          padding="xs"
                          @click="hidePopup('philHealthPopUp')"
                          style="margin: 10px"
                        />
                      </div>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <!-- <q-input
                v-model="selectedDoctor.philHealthExpirationDate"
                label="Philhealth Number"
                label-color="blue-10"
                outlined
                clearable
                :disable="!informationUpdate"
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'localContact')
                "
              /> -->

              <q-input
                v-model="selectedDoctorContact.local"
                :disable="!informationUpdate && !contactUpdate"
                label="Local Line"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'localContact')
                "
              />

              <!-- <q-input
                v-model="selectedDoctor.specialization"
                label="Area of Specialty"
                label-color="blue-10"
                outlined
                clearable
                :disable="!informationUpdate"
                class="blue-outline col-12 col-sm-4"
                @update:model-value="
                  (value) =>
                    onSelectedChange(
                      selectedDoctor,
                      value,
                      'doctorSpecialization'
                    )
                "
              /> -->

              <q-input
                v-model="selectedDoctor.dOC_CLASS"
                :disable="!informationUpdate"
                label="Class"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorClass')
                "
              />

              <q-input
                v-model="selectedDoctor.tinNumber"
                :disable="!informationUpdate"
                label="TIN Number"
                label-color="blue-10"
                outlined
                clearable
                class="blue-outline col-12 col-sm-3"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorTinNumber')
                "
              />
            </div>
          </div>

          <div class="text-blue-10 text-bold col-12 text-h5 q-mb-sm">
            Secretaries
          </div>
          <div class="q-pl-md q-pr-md q-mb-md full-width">
            <div v-if="dataDoctorSecretaries.length > 0">
              <div
                v-for="(secretary, index) in dataDoctorSecretaries"
                :key="secretary.secretaryCode"
                class="row q-col-gutter-xs q-mb-sm"
              >
                <q-input
                  v-model="secretary.nickName"
                  :label="index === 0 ? `Secretary` : `Secretary ${index + 1}`"
                  label-color="blue-10"
                  class="blue-outline col-12 col-sm-4"
                  clearable
                  :disable="!contactUpdate"
                  outlined
                  @update:model-value="
                    (value) =>
                      onSelectedChange(
                        secretary,
                        value,
                        index !== 0 ? `secretary${index + 1}` : 'secretary'
                      )
                  "
                />

                <q-input
                  v-model="secretary.contactNumber"
                  :disable="!contactUpdate"
                  :label="
                    index === 0
                      ? `Secretary Contact Number`
                      : `Secretary ${index + 1} Contact Number`
                  "
                  label-color="blue-10"
                  class="blue-outline col-12 col-sm-4"
                  clearable
                  outlined
                  @update:model-value="
                    (value) =>
                      onSelectedChange(
                        secretary,
                        value,
                        index !== 0
                          ? `secretary${index + 1}Number`
                          : 'secretaryNumber'
                      )
                  "
                />
                <q-input
                  v-model="secretary.contactNumber2"
                  :label="
                    index === 0
                      ? `Secretary Contact Number 2`
                      : `Secretary ${index + 1} Contact Number 2`
                  "
                  label-color="blue-10"
                  class="blue-outline col-12 col-sm-4"
                  clearable
                  outlined
                  @update:model-value="
                    (value) =>
                      onSelectedChange(
                        secretary,
                        value,
                        index !== 0
                          ? `secretary${index + 1}Number2`
                          : 'secretaryNumber2'
                      )
                  "
                />
              </div>
            </div>
            <div v-else class="text-italic text-h6">
              No Secretaries Assigned
            </div>
          </div>

          <div class="text-blue-10 text-bold col-12 text-h5 q-mb-sm">
            Department / Specialties
          </div>
          <div class="q-pl-md q-pr-md q-mb-md full-width">
            <div class="row q-col-gutter-xs">
              <q-select
                v-model="departmentValue"
                :disable="!informationUpdate"
                label="Specialty / Department"
                label-color="blue-10"
                :options="filteredOptions('department')"
                option-label="label"
                option-value="value"
                multiple
                use-chips
                use-input
                fill-input
                outlined
                input-debounce="0"
                @filter="filterFn"
                class="blue-outline col-12 col-md-6"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorSpecialty')
                "
              />

              <q-select
                v-model="specialtiesValue"
                :disable="!informationUpdate"
                label="Subspecialty"
                label-color="blue-10"
                :options="filteredOptions('specialty')"
                option-label="label"
                option-value="value"
                multiple
                use-chips
                use-input
                fill-input
                outlined
                input-debounce="0"
                @filter="filterFn"
                class="blue-outline col-12 col-md-6"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctor, value, 'doctorSpecialty')
                "
              />
            </div>
          </div>

          <div class="text-blue-10 text-bold col-12 text-h5 q-mb-sm">
            Accredited Health Maintenance Organization
          </div>
          <div class="q-pl-md q-pr-md q-mb-md full-width">
            <div class="row q-col-gutter-md">
              <q-select
                v-model="hmoValue"
                label="Accredited HMO's"
                label-color="blue-10"
                :options="filteredOptions('hmo')"
                option-label="nAME"
                option-value="cODE"
                multiple
                use-chips
                use-input
                fill-input
                outlined
                input-debounce="0"
                :disable="!hmoUpdate"
                @filter="filterFn"
                class="blue-outline col-12"
                @update:model-value="
                  (value) =>
                    onSelectedChange(selectedDoctorHmo, value, 'doctorHmo')
                "
              />
            </div>
          </div>

          <p class="text-blue-10 text-bold col-12 q-pt-md text-h5">Schedule</p>
          <div class="col-12">
            <!-- <div
              v-if="!schedUpdate"
              class="text-center q-pa-md text-negative text-h6"
            >
              You don’t have access to update the schedule.
            </div> -->

            <q-table
              style="max-height: 600px"
              :rows="dataDoctorSchedule"
              :columns="scheduleColumn"
              class="custom-scroll q-pb-xs q-mb-sm"
              color="blue-10"
              row-key="day"
              virtual-scroll
              hide-pagination
              :rows-per-page-options="[0]"
            >
              <template v-slot:header>
                <q-tr class="sticky-thead bg-blue-10">
                  <q-th
                    v-for="col in scheduleColumn"
                    :key="col.name"
                    class="text-center text-white bold-header"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-if="!schedUpdate" v-slot:body="props">
                <q-tr v-if="props.rowIndex === 0">
                  <q-td :colspan="scheduleColumn.length">
                    <div class="text-center text-red-10 text-bold text-h6">
                      You don’t have access to update the schedule
                    </div>
                  </q-td>
                </q-tr>
              </template>

              <template v-else v-slot:body="props">
                <q-tr
                  :props="props"
                  :key="props.row.day"
                  class="hover-row"
                  :class="{ 'empty-row': props.row.isEmpty }"
                >
                  <q-td
                    v-for="col in scheduleColumn"
                    :key="col.name"
                    class="text-center"
                  >
                    <template v-if="col.name === 'day'">
                      {{ dayMap[props.row.day] }}
                    </template>

                    <template v-if="col.name === 'doctorSchedule'">
                      <span v-if="!props.row.newSched">
                        {{ formatTimeTo12Hours(props.row.timeFrom) }} -
                        {{ formatTimeTo12Hours(props.row.timeTo) }}
                      </span>
                      <span v-else class="text-grey-5">No schedule</span>
                    </template>
                    <template
                      v-if="col.name === 'schedule' && props.row.active"
                    >
                      <input
                        :disabled="!props.row.active"
                        class="q-mr-xs"
                        type="time"
                        v-model="props.row.timeFrom"
                        @input="
                          onTimeChange(
                            props.row,
                            $event.target.value,
                            'timeFrom'
                          )
                        "
                      />
                      <input
                        :disabled="!props.row.active"
                        class="q-ml-xs"
                        type="time"
                        v-model="props.row.timeTo"
                        @input="
                          onTimeChange(props.row, $event.target.value, 'timeTo')
                        "
                      />
                    </template>

                    <template v-if="col.name === 'status'">
                      <div class="flex justify-center items-center">
                        <div
                          v-if="props.row.active"
                          @click="
                            onTimeChange(
                              props.row,
                              !props.row.active,
                              'activeStatus'
                            )
                          "
                          class="q-pa-xs bg-green-1 text-green-10 text-h6"
                          style="
                            width: 50%;
                            border-radius: 10%;
                            min-width: 80px;
                            padding: 8px 12px;
                            white-space: nowrap;
                          "
                        >
                          Active
                        </div>
                        <div
                          v-else
                          @click="
                            onTimeChange(
                              props.row,
                              !props.row.active,
                              'activeStatus'
                            )
                          "
                          class="q-pa-xs bg-red-2 text-red-10 text-h6"
                          style="
                            width: 50%;
                            border-radius: 10%;
                            min-width: 80px;
                            padding: 8px 12px;
                            white-space: nowrap;
                          "
                        >
                          Inactive
                        </div>
                      </div>

                      <!-- <q-select
                        dense
                        class="q-pa-sm blue-outline"
                        :class="$q.screen.gt.sm ? 'col-4' : 'col-12'"
                        v-model="props.row.consultationTypeDesc"
                        :options="consultatioTypeOptions"
                        option-label="label"
                        option-value="value"
                        label-color="blue-10"
                        :disable="!informationUpdate"
                        outlined
                        clearable
                        use-input
                        fill-input
                        input-debounce="0"
                        behavior="menu"
                        hide-selected
                        @update:model-value="
                          (value) =>
                            onTimeChange(props.row, value, 'consultType')
                        "
                      /> -->
                    </template>

                    <!-- <template v-if="col.name === 'consultationType'">
                      <q-select
                        dense
                        class="q-pa-sm blue-outline"
                        :class="$q.screen.gt.sm ? 'col-4' : 'col-12'"
                        v-model="props.row.consultationTypeDesc"
                        :options="consultatioTypeOptions"
                        option-label="label"
                        option-value="value"
                        label-color="blue-10"
                        :disable="!informationUpdate"
                        outlined
                        clearable
                        use-input
                        fill-input
                        input-debounce="0"
                        behavior="menu"
                        hide-selected
                        @update:model-value="
                          (value) =>
                            onTimeChange(props.row, value, 'consultType')
                        "
                      />
                    </template> -->

                    <template
                      v-else-if="
                        col.field &&
                        ![
                          'day',
                          'doctorSchedule',
                          'schedule',
                          'consultationType',
                        ].includes(col.name)
                      "
                    >
                      {{ props.row[col.field] || "" }}
                    </template>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>
        <div class="col-12 text-right q-mt-sm">
          <q-btn
            :disabled="
              !schedUpdate && !informationUpdate && !hmoUpdate && !contactUpdate
            "
            class="bg-positive text-white"
            push
            label="Submit Changes"
            @click="updateDoctor"
          />
        </div>
      </q-card-section>
    </q-card>
    <q-card
      v-if="!doctorConfig"
      class="bg-grey-2"
      style="
        border-radius: 10px;
        width: 100%;
        max-width: 1000px;
        position: relative;
      "
      :class="['bold-text', $q.screen.name + '-text']"
    >
      <q-card-section>
        <div class="row q-pa-none SecHeaderColor">
          <q-icon class="q-mr-sm" name="keyboard_backspace" />
          <p
            style="font-size: 20px; cursor: pointer"
            @click="$emit('close', dataConfig)"
          >
            Back to Doctor's List
          </p>
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-sm-4">
            <div class="row">
              <div class="col-12" style="height: 400px; background: #e0f7fa">
                <img
                  :src="
                    selectedDoctor.picture
                      ? selectedDoctor.picture
                      : selectedDoctor.gENDER === 'M'
                      ? docMale
                      : docFemale
                  "
                  alt="image"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 10px;
                  "
                />
              </div>
              <div class="col-12 text-left q-mt-sm">
                <div class="row text-subtitle1 items-center">
                  <div class="col-2 text-left">
                    <q-icon name="account_circle" size="lg" color="grey-5 " />
                  </div>
                  <div class="col-10 text-left">
                    <div
                      v-if="
                        selectedDoctor.secName1 ||
                        selectedDoctor.secMPN1 ||
                        selectedDoctor.secName2 ||
                        selectedDoctor.secMPN2
                      "
                      style="word-break: break-word; white-space: normal"
                    >
                      {{ selectedDoctor.secName1 }}
                      <span
                        v-if="selectedDoctor.secName2 && selectedDoctor.secMPN2"
                        >, {{ selectedDoctor.secName2 }}
                      </span>
                    </div>
                    <div v-else>Not Specified</div>
                  </div>
                </div>
              </div>

              <div class="col-12 text-left q-mt-xs">
                <div class="row text-subtitle1 items-center">
                  <div class="col-2 text-left">
                    <q-icon name="call" size="lg" color="grey-5" />
                  </div>
                  <div class="col-10 text-left">
                    <div
                      v-if="selectedDoctorContact.length > 0"
                      class="text-subtitle2"
                      style="word-break: break-word; white-space: normal"
                    >
                      <div
                        v-for="contact in selectedDoctorContact"
                        :key="contact.doctorCode"
                      >
                        <div style="flex: auto">
                          <div v-if="contact.value">
                            UERM Line: {{ contact.value }}
                          </div>
                          <div v-if="contact.direct">
                            Direct Line: {{ contact.direct }}
                          </div>
                          <div v-if="contact.local">
                            Local Line:
                            {{ contact.local.replace(/local\s*/i, "").trim() }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-else>Not Specified</div>
                  </div>
                </div>
              </div>
              <div class="col-12 q-mt-sm">
                <div class="row">
                  <div
                    class="headerColor col-12 bg-grey-4 text-center text-bold text-h6"
                  >
                    DOCTOR'S SCHEDULE
                  </div>
                  <div v-if="dataDoctorSchedule" class="col-12 q-mt-md">
                    <div
                      v-for="sched in dataDoctorSchedule"
                      :key="sched.doctorCode"
                      class="text-subtitle2 SecHeaderColor q-mb-xs"
                      style="border-bottom: 1.5px solid #ccc"
                    >
                      <div class="row justify-between">
                        <div class="text-left">{{ dayMap[sched.day] }}</div>
                        <div class="row justify-center items-center">
                          <div>
                            {{ formatTimeTo12Hours(sched.timeFrom) }} -
                            {{ formatTimeTo12Hours(sched.timeTo) }}
                          </div>
                          <q-icon name="av_timer" class="q-ml-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="text-subtitle1 q-pa-sm" v-else>
                    <div v-if="selectedDoctor.sKED">
                      {{ selectedDoctor.sKED }}
                    </div>
                    <div v-else>No Specified Schedule</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-8">
            <div class="row q-mt-lg">
              <div
                class="col-12 q-mb-sm text-h5 SecHeaderColor"
                style="
                  word-break: break-word;
                  white-space: normal;
                  line-height: 1;
                "
                :class="[$q.screen.name + '-textSpecialtyDialog']"
              >
                {{
                  selectedDoctor.specialization
                    ? selectedDoctor.specialization
                    : "Not Specified"
                }}
              </div>
              <div
                class="headerColor col-12 q-mb-xl text-h3 text-bold"
                style="
                  word-break: break-word;
                  white-space: normal;
                  line-height: 1;
                "
                :class="[$q.screen.name + '-textDoctorDialog']"
              >
                {{ selectedDoctor.doctorName }}
              </div>
              <div class="col-12 q-mb-md">
                <div class="row">
                  <div
                    class="headerColor col-12 bg-grey-4 text-left text-bold text-h6 q-pa-xs"
                  >
                    EDUCATION
                  </div>

                  <div
                    v-if="dataDoctorEducation && dataDoctorEducation.length > 0"
                    class="col-12 q-pa-xs q-mt-sm"
                  >
                    <div
                      class="q-mb-xs"
                      v-for="educ in dataDoctorEducation"
                      :key="educ.doctorCode"
                    >
                      <div class="text-bold text-subtitle1">
                        {{ educ.degreeName }}
                      </div>
                      <div class="text-caption">
                        {{ educ.institution }} - Year {{ educ.yearTo }}
                      </div>
                    </div>
                  </div>
                  <div class="col-12 q-pa-xs q-mt-sm text-subtitle1" v-else>
                    No Education Specified
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="row">
                  <div
                    class="headerColor col-12 bg-grey-4 text-left text-bold text-h6 q-pa-xs"
                  >
                    ACCREDITED HMO'S
                  </div>
                  <div class="col-12">
                    <p class="text-subtitle1 q-mt-sm q-pa-xs">
                      The following are the accredited HMOs. For inquiries,
                      please call 8-715-0861 to 77 local 241/ 508 or visit us at
                      the Upper Ground Floor, Medical Arts Building.
                    </p>
                    <div
                      style="height: 200px"
                      v-if="
                        Array.isArray(selectedDoctorHmo) &&
                        selectedDoctorHmo.length > 0
                      "
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
                          style="height: 100%"
                          animated
                          v-model="slide"
                          :autoplay="autoplay"
                          :arrows="selectedDoctorHmo.length > 1"
                          :navigation="
                            selectedDoctorHmo.length > 1 && !$q.screen.lt.sm
                          "
                          transition-prev="slide-right"
                          transition-next="slide-left"
                          @mouseenter="autoplay = true"
                          @mouseleave="autoplay = true"
                          swipeable
                        >
                          <template
                            v-slot:navigation-icon="{ active, onClick }"
                          >
                            <template
                              v-if="
                                selectedDoctorHmo.length > 1 && !$q.screen.lt.sm
                              "
                            >
                              <q-btn
                                :class="active ? 'bg-blue-10' : 'bg-yellow-8'"
                                class="custom-btn"
                                flat
                                round
                                @click="onClick"
                              />
                            </template>
                          </template>

                          <q-carousel-slide
                            v-for="doctor in selectedDoctorHmo"
                            :key="doctor.hmoDescription"
                            :name="doctor.hmoDescription"
                            class="column items-center justify-center q-pa-md"
                          >
                            <div class="text-center">
                              <div
                                v-if="!doctor.imageFile"
                                class="text-bold q-mb-xl"
                                style="font-size: 20px; margin-top: 33px"
                              >
                                {{ doctor.hmoDescription }}
                              </div>
                              <img
                                v-else
                                :src="doctor.imageFile"
                                alt="image"
                                class="text-bold q-mb-lg"
                                style="
                                  width: 100%;
                                  height: auto;
                                  max-height: 200px;
                                "
                              />
                            </div>
                          </q-carousel-slide>
                        </q-carousel>
                      </div>
                    </div>

                    <div v-else class="q-pa-xs text-subtitle1">
                      No Health Maintenance Organizations accredited.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import docMale from "assets/images/doctorMale.png";
import docFemale from "assets/images/doctorFemale.png";
import helperMethods from "src/helperMethods";
import Loader from "./Loader.vue";
import { mapGetters } from "vuex";
import { date } from "quasar";

export default {
  emits: ["statusUpdated", "close"],
  props: {
    doctorConfig: Boolean,
    dataDoctor: Object,
    dataDoctorHmo: Object,
    dataDoctorSchedule: Object,
    dataDoctorEducation: Object,
    dataDoctorContacts: Object,
    hmoOptions: Object,
    consultatioTypeOptions: Object,
    deptSpecOptions: Object,
    slideValue: String,
    dataDoctorSecretaries: Object,
  },
  data() {
    return {
      slide: this.slideValue,
      autoplay: true,
      dialogVisible: true,
      selectedDoctorHmo: this.dataDoctorHmo,
      selectedDoctor: this.dataDoctor,
      selectedDoctorContact: this.dataDoctorContacts,
      selectedDoctorSchedule: this.dataDoctorSchedule,
      imageApi: process.env.ImageApi,
      docFemale,
      docMale,
      daysValue: [
        { value: "MON", label: "Monday" },
        { value: "TUE", label: "Tuesday" },
        { value: "WED", label: "Wednesday" },
        { value: "THU", label: "Thursday" },
        { value: "FRI", label: "Friday" },
        { value: "SAT", label: "Saturday" },
        { value: "SUN", label: "Sunday" },
      ],
      updatedDoctorName: null,
      updatedDoctorRoom: null,
      updatedDoctorSpecialty: null,
      updatedDoctorTimeFrom: null,
      updatedDoctorTimeTo: null,
      updatedDoctorConsultation: null,
      scheduleColumn: [
        {
          name: "day",
          label: "Day",
          align: "center",
          field: "",
          width: "350px",
        },
        // {
        //   name: "doctorSchedule",
        //   label: "Doctor Schedule",
        //   align: "center",
        //   field: "",
        //   width: "250px",
        // },
        {
          name: "schedule",
          label: "Set Schedule",
          align: "center",
          field: "",
          width: "350px",
        },
        {
          name: "status",
          label: "Status",
          align: "center",
          field: "",
          width: "300px",
        },
      ],
      originalDoctorData: null,
      originalScheduleData: [],

      dataCombine: [],
      specialtiesValue: [],
      specialtiesOrigValue: [],

      departmentValue: [],
      departmentOrigValue: [],

      hmoValue: [],
      hmoOrigValue: [],
      loader: false,

      hmos: this.hmoOptions,
      specDeptOptions: this.deptSpecOptions,
      licExpiration: null,
      philExpiration: null,
      scheduleOrigValue: null,
    };
  },

  components: {
    Loader,
  },

  computed: {
    ...mapGetters({
      informationUpdate: "userModule/informationUpdate",
      schedUpdate: "userModule/schedUpdate",
      contactUpdate: "userModule/contactUpdate",
      hmoUpdate: "userModule/hmoUpdate",
    }),

    computedSelectedDoctors() {
      if (!Array.isArray(this.selectedDoctor)) return [];

      return this.selectedDoctor.map((doctor) => {
        const { firstName, middleName, lastName, suffix, name } = doctor;

        const isIncomplete =
          !firstName ||
          firstName.trim() === "" ||
          !middleName ||
          middleName.trim() === "" ||
          !lastName ||
          lastName.trim() === "";

        if (isIncomplete) {
          return {
            ...doctor,
            doctorName: name,
          };
        }

        const middleInitial = middleName.charAt(0).toUpperCase() + ".";
        const fullName = `${lastName}, ${firstName} ${middleInitial}${
          suffix ? " " + suffix : ""
        }`;

        return {
          ...doctor,
          doctorName: fullName,
        };
      });
    },

    dayMap() {
      return Object.fromEntries(this.daysValue.map((d) => [d.value, d.label]));
    },

    parsedSchedule() {
      if (!this.selectedDoctor || !this.selectedDoctor.doctorSchedule)
        return [];

      return this.selectedDoctor.doctorSchedule.split(",").map((item) => {
        const parts = item.trim().split(" - ");
        return {
          day: parts[0].trim(),
          time: parts[1]?.replace(/\(|\)/g, "").trim() || "",
          type: parts[2]?.trim() || "",
        };
      });
    },

    // completeWeekSchedule() {
    //   const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

    //   const scheduleMap = {};

    //   for (const sched of this.dataDoctorSchedule) {
    //     scheduleMap[sched.day] = sched;
    //   }

    //   return weekDays.map((day, index) => {
    //     const existingSchedule = scheduleMap[day];

    //     if (existingSchedule) {
    //       return existingSchedule;
    //     } else {
    //       return {
    //         id: `New, ${day}`,
    //         doctorCode: this.dataDoctorSchedule[0]?.doctorCode || null,
    //         day: day,
    //         timeFrom: null,
    //         timeTo: null,
    //         remarks: null,
    //         consultationTypeDesc: null,
    //         isEmpty: true,
    //       };
    //     }
    //   });
    // },

    // formattedLicenseExpiration: {
    //   get() {
    //     if (!this.selectedDoctor.licenseExpirationDate) return "";
    //     return new Date(
    //       this.selectedDoctor.licenseExpirationDate
    //     ).toLocaleDateString("en-US", {
    //       year: "numeric",
    //       month: "long",
    //       day: "numeric",
    //     });
    //   },
    //   set(val) {
    //     this.selectedDoctor.licenseExpirationDate = new Date(val).toISOString();
    //   },
    // },
  },

  methods: {
    filteredOptions(type) {
      if (type === "specialty") {
        return this.specDeptOptions.filter((option) => option.parent !== null);
      } else if (type === "department") {
        return this.specDeptOptions.filter((option) => option.parent === null);
      } else {
        return this.hmos;
      }
    },

    filterFn(val, update) {
      if (val === "") {
        update(() => {
          this.hmos = this.hmoOptions;
          this.specDeptOptions = this.deptSpecOptions;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.hmos = this.hmoOptions.filter(
          (option) => option.nAME.toLowerCase().indexOf(needle) > -1
        );
        this.specDeptOptions = this.deptSpecOptions.filter(
          (option) => option.label.toLowerCase().indexOf(needle) > -1
        );
      });
    },

    showPopup(refName) {
      this.$refs[refName].show();
    },

    hidePopup(refName) {
      this.$refs[refName].hide();
    },

    // formatTimeTo12Hours(time) {
    //   const dateObj = new Date(time);

    //   if (isNaN(dateObj)) {
    //     return "";
    //   }
    //   return dateObj.toLocaleTimeString("en-US", {
    //     hour: "numeric",
    //     minute: "numeric",
    //     hour12: true,
    //   });
    // },
    formatTimeTo12Hours(time) {
      if (!time || !/^\d{2}:\d{2}$/.test(time)) {
        return "";
      }

      const [hourStr, minuteStr] = time.split(":");
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (isNaN(hour) || isNaN(minute)) {
        return "";
      }

      const period = hour >= 12 ? "PM" : "AM";

      hour = hour % 12;
      hour = hour === 0 ? 12 : hour;

      const minuteFormatted = minute.toString().padStart(2, "0");

      return `${hour}:${minuteFormatted} ${period}`;
    },

    getParentBody() {
      try {
        if (window.parent && window.parent !== window) {
          return window.parent.document.body;
        }
        return document.body;
      } catch (e) {
        return document.body;
      }
    },

    onTimeChange(item, value, field) {
      if (!this.dataCombine.length) {
        this.dataCombine.push({
          docInfo: [{}],
          scheduleData: [],
          contactData: [{}],
          docSpecialty: [],
          docSecretary: [],
          docHmo: [],
        });
      }

      if (field === "activeStatus") {
        this.dataDoctorSchedule.map((index) => {
          if (item.id === index.id) {
            index.active = value;
          }
        });
      }

      const scheduleList = this.dataCombine[0].scheduleData;

      const existing = scheduleList.find((s) => s.id === item.id);

      if (existing) {
        if (field === "activeStatus") {
          existing.active = value;
        } else {
          existing[field] = value;
        }
      } else {
        const scheduleData = {
          doctorCode: item.doctorCode,
          id: item.id,
          day: item.day,
          timeFrom: field === "timeFrom" ? value : item.timeFrom,
          timeTo: field === "timeTo" ? value : item.timeTo,
          active: field === "activeStatus" ? value : item.active ?? 1,
        };

        scheduleList.push(scheduleData);
      }

      console.log(this.dataCombine);
    },

    onSelectedChange(item, value, type) {
      const typeProperty = {
        doctorFirstName: "[FIRST NAME]",
        doctorLastName: "[LAST NAME]",
        doctorMiddleName: "[MIDDLE NAME]",
        doctorSuffix: "Suffix",
        doctorRoom: "ROOM",
        doctorSpecialization: "[AREA OF SPECIALTY]",
        doctorLicense: "LIC",
        doctorContact: "CONTACTNOS",
        doctorClass: "DOC_CLASS",
        uermContact: "value",
        directContact: "direct",
        localContact: "local",
        doctorPhilhealth: "PHIC",
        licenseExpiration: "[LIC EXP DATE]",
        philhealthExpiration: "[PHIC EXP DATE]",
        doctorMobile: "MPN1",
        doctorMobile2: "MPN2",
        doctorTinNumber: "TIN",
        secretary: "nickName",
        secretaryNumber: "contactNumber",
        secretaryNumber2: "contactNumber2",
        secretary2: "nickName",
        secretary2Number: "contactNumber",
        secretary2Number2: "contactNumber2",
      };

      if (!this.dataCombine.length) {
        this.dataCombine.push({
          docInfo: [{}],
          scheduleData: [],
          contactData: [{}],
          docSpecialty: [],
          docSecretary: [],
          docHmo: [],
        });
      }

      if (
        type === "doctorFirstName" ||
        type === "doctorMiddleName" ||
        type === "doctorLastName" ||
        type === "doctorRoom" ||
        type === "doctorSpecialization" ||
        type === "doctorLicense" ||
        type === "doctorContact" ||
        type === "doctorClass" ||
        type === "doctorPhilhealth" ||
        type === "licenseExpiration" ||
        type === "philhealthExpiration" ||
        type === "doctorMobile" ||
        type === "doctorMobile2" ||
        type === "doctorTinNumber" ||
        type === "doctorSuffix"
      ) {
        const docInfoObj = this.dataCombine[0].docInfo[0];

        if (!docInfoObj.EHR_CODE && item?.doctorEhrCode) {
          docInfoObj.EHR_CODE = item.doctorEhrCode;
        }

        const propertyName = typeProperty[type];
        docInfoObj[propertyName] = value || null;
      }

      if (type === "doctorSpecialty") {
        if (this.hasChanged()) {
          const specialtyList = this.dataCombine[0].docSpecialty;
          const existing = specialtyList.find(
            (c) => c.doctorEhrCode === item.doctorEhrCode
          );

          const deptOrig = this.departmentOrigValue.map((v) => v.value.trim());
          const specOrig = this.specialtiesOrigValue.map((v) => v.value.trim());

          const currentSpecialties = this.specialtiesValue.map((v) =>
            v.value.trim()
          );

          const currentDepartments = this.departmentValue.map((v) =>
            v.value.trim()
          );

          const missingSpecialties = specOrig.filter(
            (spec) => !currentSpecialties.includes(spec)
          );

          const missingDepartments = deptOrig.filter(
            (dept) => !currentDepartments.includes(dept)
          );

          const newSpecialty = {
            doctorEhrCode: item.doctorEhrCode,
            specialties: currentSpecialties,
            departments: currentDepartments,
            missingOrigSpecialties: missingSpecialties,
            missingOrigDepartments: missingDepartments,
          };

          if (existing) {
            Object.assign(existing, newSpecialty);
          } else {
            specialtyList.push(newSpecialty);
          }
        }
      }

      if (
        type === "secretary" ||
        type === "secretary2" ||
        type === "secretaryNumber" ||
        type === "secretaryNumber2" ||
        type === "secretary2Number" ||
        type === "secretary2Number2"
      ) {
        const secInfoArr = this.dataCombine[0].docSecretary || [];

        let index = 0;
        if (type.startsWith("secretary2")) {
          index = 1;
        }

        if (!secInfoArr[index]) {
          secInfoArr[index] = {};
        }

        const secInfoObj = secInfoArr[index];

        if (!secInfoObj.code && item?.secretaryCode) {
          secInfoObj.code = item.secretaryCode;
        }

        const propertyName = typeProperty[type];

        secInfoObj[propertyName] =
          value !== undefined && value !== "" ? value : null;
      }

      if (
        type === "uermContact" ||
        type === "directContact" ||
        type === "localContact"
      ) {
        const contaInfoObj = this.dataCombine[0].contactData[0];

        if (!contaInfoObj.DoctorEhrCode && item?.doctorEhrCode) {
          contaInfoObj.doctorEhrCode = item.doctorEhrCode;
        }

        contaInfoObj.id = this.selectedDoctorContact
          ? this.selectedDoctorContact.id
          : null;

        const propertyName = typeProperty[type];
        contaInfoObj[propertyName] = value;
      }

      if (type === "doctorHmo") {
        if (this.hasChanged()) {
          const hmolist = this.dataCombine[0].docHmo;
          const existing = hmolist.find(
            (h) => h.doctorEhrCode === item[0].drCode
          );

          const hmoOrig = this.hmoOrigValue.map((v) => v.cODE);

          const currentHmo = this.hmoValue.map((v) => v.cODE);

          const missingHmo = hmoOrig.filter((hmo) => !currentHmo.includes(hmo));

          const newHmo = {
            doctorEhrCode: item[0].drCode,
            hmo: currentHmo,
            missingHmo: missingHmo,
          };

          if (existing) {
            Object.assign(existing, newHmo);
          } else {
            hmolist.push(newHmo);
          }
        }
      }
    },

    // toggleActive(item) {
    //   console.log(item.active);
    // },

    async updateDoctor() {
      if (this.dataCombine.length === 0) {
        this.$q.notify({
          color: "negative",
          position: "center",
          message: `Please specify some changes`,
          icon: "report_problem",
          iconColor: "white",
          timeout: 1500,
          progress: true,
        });
        return;
      }

      const scheduleData = this.dataCombine[0].scheduleData;

      const hasIncompleteSched = scheduleData.some(
        (item) =>
          item.timeFrom === null ||
          item.timeTo === null ||
          item.timeFrom === "" ||
          item.timeTo === ""
      );

      if (hasIncompleteSched) {
        this.$q.notify({
          color: "negative",
          position: "center",
          message: `Please specify some changes time from and time to`,
          icon: "report_problem",
          iconColor: "white",
          timeout: 1500,
          progress: true,
        });
        return;
      }

      const schedChange = this.dataCombine[0]?.scheduleData.some((newItem) => {
        const origItem = this.scheduleOrigValue.find(
          (o) => o.id === newItem.id
        );

        if (!origItem) {
          return true;
        }

        return (
          newItem.active !== origItem.active ||
          newItem.day !== origItem.day ||
          newItem.doctorCode !== origItem.doctorCode ||
          newItem.timeFrom !== origItem.timeFrom ||
          newItem.timeTo !== origItem.timeTo
        );
      });

      if (!schedChange) {
        this.$q.notify({
          color: "negative",
          position: "center",
          message: `Please specify some changes`,
          icon: "report_problem",
          iconColor: "white",
          timeout: 1500,
          progress: true,
        });
        return;
      }

      helperMethods.disablePointerEvents();
      this.$q
        .dialog({
          title: "Confirmation",
          message:
            "Are you sure you want to update the information of the doctor?",
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
          try {
            await this.$store.dispatch(
              "doctorsModule/updateDoctor",
              this.dataCombine
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
            this.$emit("statusUpdated", true);
            this.dataCombine = [];
            helperMethods.enablePointerEvents();
          } catch (error) {
            this.loader = false;
            this.$emit("statusUpdated");
            helperMethods.enablePointerEvents();
            this.dataCombine = [];
            console.log(error);
            if (error.response.status === 409) {
              this.$q.notify({
                color: "negative",
                position: "center",
                message: `${
                  error.response?.data?.body || "Error updating doctor"
                }`,
                icon: "report_problem",
                iconColor: "white",
                timeout: 1500,
                progress: true,
              });
            }
            console.error(error);
          }
        })
        .onCancel(() => {
          helperMethods.enablePointerEvents();
        })
        .onDismiss(() => {
          helperMethods.enablePointerEvents();
        });
    },

    hasChanged() {
      const currentSpecialties = this.specialtiesValue
        .map((item) => item.value)
        .sort()
        .join(",");

      const originalSpecialties = this.specialtiesOrigValue
        .map((item) => item.value)
        .sort()
        .join(",");

      const currentDepartments = this.departmentValue
        .map((item) => item.value)
        .sort()
        .join(",");

      const originalDepartments = this.departmentOrigValue
        .map((item) => item.value)
        .sort()
        .join(",");

      const currentHmo = this.hmoValue
        .map((item) => item.cODE)
        .sort()
        .join(",");

      const originalHmo = this.hmoOrigValue
        .map((item) => item.cODE)
        .sort()
        .join(",");

      return (
        currentSpecialties !== originalSpecialties ||
        currentDepartments !== originalDepartments ||
        currentHmo !== originalHmo
      );
    },

    initValues() {
      const specilatyCodes =
        this.selectedDoctor.specialtyCodes?.split(",") || [];
      const specialtylabels = this.selectedDoctor.specialties?.split(",") || [];

      this.specialtiesValue = specilatyCodes.map((code, index) => ({
        value: code,
        label: specialtylabels[index] || code,
      }));

      this.specialtiesOrigValue = JSON.parse(
        JSON.stringify(this.specialtiesValue)
      );

      const departmentCode =
        this.selectedDoctor.departmentCode?.split(",") || [];
      const departmentName =
        this.selectedDoctor.departmentName?.split(",") || [];

      this.departmentValue = departmentCode.map((code, index) => ({
        value: code,
        label: departmentName[index] || code,
      }));

      this.departmentOrigValue = JSON.parse(
        JSON.stringify(this.departmentValue)
      );

      this.hmoValue = (this.selectedDoctorHmo || []).map((hmo) => ({
        cODE: hmo.hmoCode,
        nAME: hmo.hmoDescription || hmo.hmoCode,
      }));

      this.hmoOrigValue = JSON.parse(JSON.stringify(this.hmoValue));

      this.scheduleOrigValue = JSON.parse(
        JSON.stringify(this.selectedDoctorSchedule)
      );
    },

    updateDoctorFullName() {
      const { firstName, middleName, lastName, suffix } = this.selectedDoctor;
      const formatLastname = lastName ? lastName : "";

      if (!firstName && !lastName) {
        this.selectedDoctor.doctorName = "";
        return;
      }

      const middleInitial = middleName?.trim()
        ? middleName.trim().charAt(0).toUpperCase() + "."
        : "";

      const suffixText = suffix ? ` ${suffix}` : "";

      this.selectedDoctor.doctorName =
        `${formatLastname}, ${firstName} ${middleInitial}${suffixText}`.trim();
    },
  },

  mounted() {
    this.initValues();
  },

  watch: {
    "selectedDoctor.firstName": "updateDoctorFullName",
    "selectedDoctor.middleName": "updateDoctorFullName",
    "selectedDoctor.lastName": "updateDoctorFullName",
    "selectedDoctor.suffix": "updateDoctorFullName",
  },
};
</script>
