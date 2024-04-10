<script setup>

import {computed, ref} from "vue";

const props = defineProps(["content", "color", "hideContent"])

let hintVisible = ref(false);
const hintX = ref(0)
const hintY = ref(0)

function showHint() {
  hintVisible.value = true
  setTimeout(() => hintVisible.value = false, 1000)
}

function copy(event) {
  hintX.value = event.clientX
  hintY.value = event.clientY
  showHint();
  navigator.clipboard.writeText(props.content);
}

const hintText = computed(() => props.hideContent ? "Copied!" : `Copied ${props.content}`)

</script>

<template>
  <div v-show="hintVisible" class="tooltiptext">{{hintText}}</div>
  <div class="clickable"  @click="copy">
    <slot></slot>
  </div>
</template>

<style scoped>

.tooltiptext {
  display: block;
  width: fit-content;
  color: v-bind(props.color);
  text-align: center;
  border-radius: 0.5em;
  padding: 0.25em;
  top: v-bind(hintY)px;
  left: v-bind(hintX)px;
  position: absolute;
  z-index: 999;
  background: white;
  border: #333333 1px solid;
}
.clickable {
  cursor: pointer;
}
</style>