<template>
  <div v-if="$q.screen.gt.sm" class="essential-links">
    <q-btn-group flat push>
      <q-btn
        class="specific-button text-blue-10"
        :to="link"
        :class="[
          $q.screen.name + '-textTitle',
          { activeLink: $route.path === link },
        ]"
      >
        {{ title }}
      </q-btn>
    </q-btn-group>
  </div>

  <div v-else>
    <q-item
      clickable
      :class="['specific-button', { activeLink: $route.path === link }]"
      :to="link"
    >
      <q-item-section class="text-bold text-blue-10 text-subtitle2">
        {{ title }}
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "EssentialLink",
  props: {
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
  },

  methods: {},
});
</script>
