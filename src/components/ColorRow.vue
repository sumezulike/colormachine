<script setup>

import Color from "@/components/Color.vue";
import {ref} from "vue";
const props = defineProps(["title"])
const hidden = ref(false);
</script>

<template>
  <div class="headline">
    <h2>{{props.title}}</h2>
    <label :for="'hideButton'+props.title" :class="hidden ? 'hiddenEye' : 'unhiddenEye'">&#128065;</label>
    <input :id="'hideButton'+props.title" type="checkbox" class="hideButton" v-model="hidden">
  </div>
  <div :class="{colors: true, hidden: hidden}">
  <slot></slot>
  </div>
</template>

<style scoped>
.colors {
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  max-height: 100px;
  transition: max-height 0.2s ease-in-out;
}
.hidden {
  max-height: 0;
  transition: max-height 0.2s ease-in-out;
}
.headline {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.hideButton {
  visibility: hidden;
}
.unhiddenEye {
  color: lightskyblue;
  font-size: 2em;
  margin: 0.2em;
  cursor: pointer;
}
.hiddenEye {
  color: purple;
  font-size: 2em;
  cursor: pointer;
  margin: 0.2em;
}

</style>