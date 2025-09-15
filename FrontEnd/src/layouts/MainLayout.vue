<template>
  <q-layout view="lHh Lpr lFf">
    <!-- <q-header class="bg-white q-pa-xs headerFooterContainer">
      <q-toolbar style="height: 100px; justify-content: space-between">
        <div class="q-pt-sm q-pb-sm flex items-center">
          <img
            src="../assets/images/uerm-hospital-logo.png"
            alt="Hospital Logo"
            :class="[$q.screen.name + '-heightLogo']"
            style="margin-right: 16px"
          />
        </div>

        <div class="q-pr-sm">
          <div v-if="$q.screen.gt.sm" class="essential-links">
            <EssentialLink
              v-for="link in essentialLinks"
              :key="link.title"
              v-bind="link"
            />
          </div>
          <div v-else>
            <q-btn-dropdown
              v-model="isDropdownOpen"
              :icon="isDropdownOpen ? 'close' : 'menu'"
              class="no-arrow-dropdown bg-yellow-8 text-blue-10"
            >
              <q-list>
                <EssentialLink
                  v-for="link in essentialLinks"
                  :key="link.title"
                  v-bind="link"
                />
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </q-toolbar>
    </q-header> -->

    <q-page-container>
      <router-view />
    </q-page-container>

    <div v-if="this.$route.path !== '/doctors'" class="floating-npc-logo">
      <a href="https://privacy.gov.ph/npc-privacy-policy-2/" target="_blank">
        <img
          src="../assets/images/NPC.png"
          alt="NPC Logo"
          style="height: 75px"
        />
      </a>
    </div>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { mapGetters } from "vuex";

export default defineComponent({
  data() {
    const leftDrawerOpen = ref(false);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      isDropdownOpen: false,
    };
  },

  components: {
    EssentialLink,
  },

  computed: {
    ...mapGetters({
      mainList: "linkList/getMainLinks",
      specialization: "doctorsModule/getSpecialization",
    }),

    essentialLinks() {
      return this.mainList[0].children;
    },

    hmoLinks() {
      return this.specialization;
    },
  },

  methods: {
    onHmoClick(hmo) {
      this.$emit("hmo-clicked", hmo);
    },
  },
});
</script>
