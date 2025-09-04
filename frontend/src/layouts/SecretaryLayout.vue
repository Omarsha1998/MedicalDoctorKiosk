<template>
  <q-layout view="hHh Lpr lff">
    <Loader :isLoading="loader" :logout="true" />
    <q-header elevated class="bg-blue-10">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleDrawer"
        />
        <q-toolbar-title style="cursor: pointer">
          {{ app_name }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer style="position: relative" v-model="drawer" show-if-above>
      <q-btn
        flat
        round
        dense
        size="md"
        icon="close"
        class="drawerBtn"
        @click="toggleDrawer"
      />

      <div
        class="q-pa-none text-center drawerStyle"
        style="
          position: absolute;
          inset: 10px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
        "
      >
        <div style="position: sticky; top: 0">
          <q-card-section style="margin: 75px 0">
            <div class="avatar-container">
              <q-avatar size="160px" class="absolute-center">
                <img :src="imageApi + secretaryCode" alt="avatar" />
              </q-avatar>
            </div>
          </q-card-section>

          <div header class="text-center q-pb-lg">
            <span class="text-subtitle2 text-grey-8 q-pa-none">
              {{ secretaryCode }}
            </span>
            <div class="text-subtitle1 text-bold q-pa-none">
              {{ secretaryName }}
            </div>
          </div>
        </div>

        <div
          class="drawerScroll q-pa-none"
          style="
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
          "
        >
          <q-list>
            <q-item class="flex column">
              <SecretaryLink
                v-for="link in filteredLinks"
                :key="link.title"
                v-bind="link"
              />
            </q-item>
          </q-list>
        </div>
        <div style="padding: 10px; text-align: center; flex-shrink: 0">
          <q-btn
            style="width: 100%"
            class="bg-negative text-white"
            icon="logout"
            name="logout"
            label="logout"
            @click="onLogout()"
          />
        </div>

        <div style="text-align: center; flex-shrink: 0">
          <div style="display: flex; justify-content: center">
            <img
              src="../assets/images/uerm-hospital-logo.png"
              alt="logo"
              style="width: 60%; height: auto; max-height: 100px"
            />
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import SecretaryLink from "components/SecretaryLink.vue";
import { mapGetters } from "vuex";
import helperMethods from "src/helperMethods";
import Loader from "../components/Loader.vue";

const linksList = [
  {
    title: "Doctor Attendance",
    caption: "Doctor Attendance",
    icon: "personal_injury",
    link: "/doctor-attendance",
  },
  {
    title: "Patient Kiosk",
    caption: "Patient Kiosk",
    icon: "medication_liquid",
    link: "/",
  },
  {
    title: "Secretary Config",
    caption: "Secretary Config",
    link: "/admin-config",
    icon: "contact_emergency",
  },
  {
    title: "Doctors Config",
    caption: "Doctors Config",
    link: "/doctors-config",
    icon: "medical_services",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    SecretaryLink,
    Loader,
  },

  data() {
    return {
      app_name: process.env.APP_NAME,
      essentialLinks: linksList,
      drawer: false,
      imageApi: process.env.ImageApi,
      loader: false,
    };
  },

  computed: {
    ...mapGetters({
      secretaryCode: "userModule/getSecretaryCode",
      secretaryName: "userModule/getSecretaryName",
      informationUpdate: "userModule/informationUpdate",
      contactUpdate: "userModule/contactUpdate",
      schedUpdate: "userModule/schedUpdate",
      hmoUpdate: "userModule/hmoUpdate",
      secConfig: "userModule/secConfig",
      doctorConfig: "userModule/doctorConfig",
    }),

    filteredLinks() {
      return this.essentialLinks.filter((link) => {
        if (link.title === "Secretary Config" && !this.secConfig) {
          return false;
        }

        if (link.title === "Doctors Config" && !this.doctorConfig) {
          return false;
        }

        return true;
      });
      // return this.essentialLinks.filter((link) => {
      //   if (link.title === "Secretary Config" && !this.doctorConfig) {
      //     return false;
      //   }
      //   if (
      //     link.title === "Doctors Config" &&
      //     !(this.licenseUpdate || this.informationUpdate)
      //   ) {
      //     return false; // hide Doctors Config unless access is granted
      //   }
      //   return true;
      // });
    },
  },

  methods: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    },

    async onLogout() {
      this.loader = true;
      // this.$q.loading.show({
      //   spinner: QSpinnerIos,
      //   message: "Logging Out",
      //   messageColor: "blue-10",
      //   backgroundColor: "grey-1",
      //   spinnerColor: "blue-10",
      //   customClass: "custom-loading-style",
      //   spinnerSize: "7em",
      // });
      await this.$store.dispatch("userModule/logout", this.secretaryCode);
      this.loader = false;
      // this.$q.loading.hide();
    },
  },
});
</script>

<style></style>
