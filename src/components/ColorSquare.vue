<script setup>
import { computed } from "vue";
import { chroma, getClosestColor } from "@/color.js";
import Copyable from "@/components/ClipboardCopy.vue";

const props = defineProps(["color"]);
const color = computed(() => chroma(props.color));
const textColor = computed(() =>
  chroma.contrast(color.value, "black") > 4.5 ? "black" : "white",
);

const closestColorname = computed(() => getClosestColor(color.value));
const rgb = computed(() => color.value.css().toUpperCase());
</script>

<template>
  <div class="color">
    <Copyable
      :content="color.hex().toUpperCase()"
      :color="textColor"
      :bg-color="color"
    >
      <div class="square">
        <span class="hex">{{ color.hex().toUpperCase() }}</span>
      </div>
    </Copyable>
    <Copyable :content="rgb" :color="textColor" :bg-color="color">
      <div class="rgb">
        <h3>{{ rgb }}</h3>
      </div>
    </Copyable>
    <Copyable :content="closestColorname" :color="textColor" :bg-color="color">
      <div class="name">{{ closestColorname }}</div>
    </Copyable>
    <slot></slot>
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
