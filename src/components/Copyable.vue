<script setup>

import {ref} from "vue";

const props = defineProps(["content", "color"])

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

</script>

<template>
  <span v-show="hintVisible" class="tooltiptext" :style="{top: hintY.value, left: hintX.value}">Copied '{{content}}'</span>
  <div class="clickable"  @click="copy">
    <slot></slot>
  </div>
</template>

<style scoped>

.tooltiptext {
  width: fit-content;
  color: v-bind(props.color);
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;

  position: absolute;
  z-index: 999;
}
.clickable {
  cursor: pointer;
}
</style>