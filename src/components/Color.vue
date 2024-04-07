<script setup>
import {onMounted, ref, computed} from "vue";
import chroma from "chroma-js"

const props = defineProps(["color"])
const color = computed(() => chroma(props.color))
const textColor = computed(() => chroma.contrast(color.value, 'black') > 4.5 ? 'black' : 'white')

let hintVisible = ref(false);

function showHint() {
  hintVisible.value = true
  setTimeout(() => hintVisible.value = false, 1000)
}

function copyHex() {
  showHint();
  navigator.clipboard.writeText(color.value);
}


</script>

<template>
  <div class="color" @click="copyHex">
    <div class="square"><span class="hex">{{color.hex().toUpperCase()}}</span></div>
    <span v-show="hintVisible" class="tooltiptext">Copied!</span>
  </div>
</template>

<style scoped>
.color {
  width: 100px;
  display: flex;
  flex-direction: column;
  margin: 0.5em 0.5em 0;
}
.square {
  min-width: 100px;
  height: 100px;
  border-radius: 5px;
  border: 1px #888 solid;
  background-color: v-bind(color);
  cursor: pointer;

  display: flex;
  flex-direction: row;
  align-items: end;
  text-align: center;
}
.hex {
  text-align: center;
  font-size: 1.4em;
  font-family: sans-serif;
  color: v-bind(textColor);
}
.tooltiptext {
  width: 120px;
  color: v-bind(textColor);
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;

  position: fixed;
  z-index: 999;
}
</style>