<script setup>

import Color from "@/components/Color.vue";
import chroma from "chroma-js";
import {computed, ref} from "vue";
const color = defineModel("color")

function colorInput(e) {
  const c = e.target.value;
  color.value = chroma.valid(c) && c.length > 4 && (c.length > 5 || chroma(c).alpha() === 1.0) ? chroma(c) : color.value
}
const props = defineProps(['show'])

const showInputs = ref(props.show !== false);
const id = "" + chroma.random().num() + chroma.random().num() + chroma.random().num();
const textColor = computed(() => chroma.contrast(color.value, 'black') > 4.5 ? 'black' : 'white')
</script>

<template>
  <div class="color-container">
    <Color :color="color" />
    <label class="pencil" :for="'cb' + id">&#128393;</label>
    <input class="hidden" :id="'cb' + id" type="checkbox" v-model="showInputs">
  </div>
  <div v-show="showInputs" class="color-inputs">
    <input id="color-picker" type="color" :value="color" @input="colorInput">
    <input type="text" :value="color" @input="colorInput">
  </div>
</template>

<style scoped>
.color-container {
  position: relative;
}
.pencil {
  color: v-bind(textColor);
  cursor: pointer;
  position: absolute;
  top: 0.5em;
  left: 0.5em;
  font-size: 1.5em;
}
.hidden {
  visibility: hidden;
}
.color-inputs {
  display: flex;
  flex-direction: column;
  width: 100px;
}
.color-inputs input {
  width: auto;
  text-transform: uppercase;
  margin: 0.25em;
}
</style>