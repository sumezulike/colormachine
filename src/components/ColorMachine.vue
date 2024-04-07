<script setup>
import {ref, computed } from "vue"
import chroma from "chroma-js";
import ColorRow from "@/components/ColorRow.vue";
import Color from "@/components/Color.vue";
import EditableColor from "@/components/EditableColor.vue";
const baseColor = ref(chroma.random())
const baseGrays = ref(["#333333", "#7a7a7a", "#999999", "#b5b5b5", "#d4d4d4", "#eaeaea", "#f8f8f8"])
const grays = ref(baseGrays.value.map((g) => chroma(g)))
const baseShades = computed(() => grays.value.map((g) => baseColor.value.luminance(g.luminance())))
const colorSpaces = ["rgb", "hsl", "lab", "lch", "lrgb"]
const grayRatio = ref(0.8)

function resetGray() {
  grays.value = baseGrays.value.map((g) => chroma(g))
}

const mixedColors = computed(() => {
  return Object.assign(...colorSpaces.map(cs => ({ [cs]:
        grays.value.map((g, i) => chroma.mix(baseShades.value[i], g, grayRatio.value, cs)) })))
})

</script>

<template>
  <h1>ColorMachine</h1>
  <ColorRow title="Base color">
    <EditableColor v-model:color="baseColor"/>
    <h2 :style="{marginLeft: '2em'}">Gray ratio:</h2>
    <input type="range" min="0" max="1" step="0.01" v-model="grayRatio" class="slider">
    <input type="text" v-model="grayRatio" style="width: 50px;">
  </ColorRow>
  <ColorRow title="Grays">
    <EditableColor :show="false" v-for="(c, i) in grays" v-model:color="grays[i]"/>
    <input type="button" @click="resetGray" value="&#8634;">
  </ColorRow>
  <ColorRow title="Shades">
    <Color v-for="(c, i) in baseShades" :color="baseShades[i]"/>
  </ColorRow>
  <ColorRow v-for="cs in colorSpaces" :title="cs.toUpperCase()">
    <Color v-for="(mc, i) in mixedColors[cs]" :color="mixedColors[cs][i]"/>
  </ColorRow>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}
input {
  height: fit-content;
  margin: 0.5em 0.5em 0;
}
</style>
