<script setup>
import {computed} from "vue";
import chroma from "chroma-js"
import colornames from "../assets/colornames.json"
import Copyable from "@/components/Copyable.vue";

const props = defineProps(["color"])
const color = computed(() => chroma(props.color))
const textColor = computed(() => chroma.contrast(color.value, 'black') > 4.5 ? 'black' : 'white')

function getClosestColor(c) {
  let closest = "?";
  let minDist = 100000000;
  for (const [hex, name] of Object.entries(colornames)) {
    let newDist = chroma.deltaE(c, hex);
    if (newDist < minDist) {
      closest = name;
      minDist = newDist;
    }
    if (minDist === 0) {
      return closest;
    }
  }
  return closest;
}

const closestColorname = computed(() => getClosestColor(color.value))
const rgb = computed(() => color.value.css().toUpperCase())

</script>

<template>
  <div class="color">
    <Copyable :content="color.hex()" :color="textColor">
    <div class="square"><span class="hex">{{ color.hex().toUpperCase() }}</span></div>
    </Copyable>
    <Copyable :content="rgb" :color="textColor">
      <div class="rgb"><h3>{{rgb}}</h3></div>
    </Copyable>
    <Copyable :content="closestColorname" :color="textColor">
      <div class="name">{{closestColorname}}</div>
    </Copyable>
  </div>
</template>

<style scoped>
.color {
  width: 12em;
  display: flex;
  flex-direction: column;
  margin: 0.5em 0.5em 0;
  align-items: center;
}

.square {
  min-width: 12em;
  height: 12em;
  border-radius: 3em;
  border: 1px #888 solid;
  background-color: v-bind(color);

  display: flex;
  flex-direction: row;
  align-items: end;
  text-align: center;
}
.hex {
  width: 100%;
  text-align: center;
  font-size: 1.4em;
  font-family: sans-serif;
  color: v-bind(textColor);
}
</style>