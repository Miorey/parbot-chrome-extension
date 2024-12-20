<template>
  <div class="investors-container">
    <span
        v-for="(investor, index) in investors"
        :key="index"
        class="investor-tag"
        :style="{
        backgroundColor: generateTransparentColor(investor),
        borderColor: generateColor(investor)
      }"
    >
      {{ investor }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    investors: {
      type: Array,
      required: true,
    },
  },
  methods: {
    /**
     * Generates a solid color code based on a string.
     *
     * @param {string} name - The string to generate a color for.
     * @returns {string} - A hex color code.
     */
    generateColor(name) {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const color = (hash & 0x00ffffff).toString(16).toUpperCase();
      return `#${'00000'.substring(0, 6 - color.length)}${color}`;
    },

    /**
     * Generates a transparent version of the solid color.
     *
     * @param {string} name - The string to generate a color for.
     * @returns {string} - An rgba color code with 20% transparency.
     */
    generateTransparentColor(name) {
      const hexColor = this.generateColor(name).substring(1);
      const r = parseInt(hexColor.slice(0, 2), 16);
      const g = parseInt(hexColor.slice(2, 4), 16);
      const b = parseInt(hexColor.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    },
  },
};
</script>

<style>
.investors-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.investor-tag {
  padding: 5px 10px;
  border-radius: 20px;
  border: 2px solid;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
}
</style>
