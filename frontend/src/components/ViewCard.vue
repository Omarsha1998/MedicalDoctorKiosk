<template>
  <div class="row">
    <div class="col-12 text-center lineDoc">
      <span class="line"></span>
      <h3 class="text-bold" :class="[$q.screen.name + '-textTitle']">
        {{ title }}
      </h3>
      <span class="line"></span>
    </div>
    <q-card
      v-for="(service, index) in services"
      :key="service.code"
      :class="[$q.screen.gt.sm ? 'col-6' : 'col-12', 'transparent-card']"
      :style="getCardStyle(index)"
    >
      <q-card-section class="serviceTitle">
        <span
          :style="{
            fontSize: calculateFontSize(
              service.serviceDescription || service.contentDescription
            ),
          }"
        >
          {{
            stripHtmlTags(
              service.serviceDescription || service.contentDescription
            )
          }}
        </span>
      </q-card-section>

      <q-card-section style="text-align: center">
        <img
          :src="getImageSrc(service)"
          alt="Logo"
          style="
            width: 90%;
            height: 300px;
            object-fit: cover;
            border-radius: 25px;
          "
        />
      </q-card-section>

      <q-card-section>
        <div
          class="virtual-scroll q-mt-xs"
          v-html="transformHeaders(service.contentDetails)"
          style="
            max-height: 300px;
            overflow-y: auto;
            padding: 0 10px;
            text-align: justify;
          "
        ></div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import helperMethods from "src/helperMethods";
export default {
  name: "ServiceCard",
  props: {
    services: {
      type: Array,
      required: true,
    },
    title: String,
  },

  computed: {
    columns() {
      if (this.$q.screen.gt.md) return 3;
      if (this.$q.screen.gt.sm) return 2;
    },
  },

  methods: {
    getCardStyle(index) {
      return helperMethods.getCardStyle(index, this.columns);
    },

    transformHeaders(content) {
      if (!content) return "";
      return content
        .replace(/<h3>/g, '<span style="font-weight: bold; font-size: 30px;">')
        .replace(/<\/h3>/g, "</span>")
        .replace(/<p>/g, '<span style="font-size: 17px;">')
        .replace(/<\/p>/g, "</span>")
        .replace(/<ul>/g, '<ul style="font-size: 15.5px;">')
        .replace(/<li>/g, '<li style="font-size: 15.5px;">')
        .replace(/<br\s*\/?>/g, "<br>");
    },

    getImageSrc(service) {
      const fileType = service.imageFileType || "jpeg";
      return `data:image/${fileType};base64,${service.base64StringPicture}`;
    },

    stripHtmlTags(text) {
      return text.replace(/<[^>]*>/g, ""); // Remove HTML tags
    },

    calculateFontSize(text) {
      const serviceDescription = this.stripHtmlTags(text);
      const maxHeight = 60; // Maximum height for the section
      const lineHeight = 1.2; // Line height
      const lines = Math.ceil(serviceDescription.length / 30); // Adjust this divisor based on average characters per line
      const fontSize = Math.max(
        18,
        Math.min(maxHeight / lines / lineHeight, 25)
      );
      return `${fontSize}px`;
    },
  },
};
</script>
