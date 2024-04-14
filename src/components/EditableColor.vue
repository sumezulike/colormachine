<script setup>
import Color from "@/components/ColorSquare.vue";
import { chroma } from "@/color.js";
import { computed, ref } from "vue";

const color = defineModel("color");

function colorInput(e) {
  const c = e.target.value;
  color.value =
    chroma.valid(c) &&
    c.length > 4 &&
    (c.length > 5 || chroma(c).alpha() === 1.0)
      ? chroma(c)
      : color.value;
}
const props = defineProps([
  "show",
  "id",
  "hidePencil",
  "hideDelete",
  "deleteFunc",
]);

const showInputs = ref(props.show !== false);
const textColor = computed(() =>
  chroma.contrast(color.value, "black") > 4.5 ? "black" : "white",
);
</script>

<template>
  <div class="editable-container">
    <div class="color-container">
      <Color :color="color">
        <slot name="color-slot"></slot>
      </Color>
      <slot></slot>
      <div v-if="!props.hidePencil">
        <label class="pencil" :for="'edit-' + props.id">
          <svg
            :fill="textColor"
            xmlns="http://www.w3.org/2000/svg"
            width="2em"
            height="2em"
            viewBox="0 0 24 24"
          >
            <path
              d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
            /></svg
        ></label>
        <input
          class="hidden"
          :id="'edit-' + props.id"
          type="checkbox"
          v-model="showInputs"
        />
      </div>
      <div v-if="!props.hideDelete">
        <label class="delete" :for="'delete-' + props.id">
          <svg
            width="2em"
            height="2em"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 5L19 19M5 19L19 5"
              :stroke="textColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </label>
        <input
          class="hidden"
          :id="'delete-' + props.id"
          type="checkbox"
          @click="props.deleteFunc"
        />
      </div>
    </div>
    <div v-if="showInputs">
      <slot name="inputs">
        <div class="color-inputs">
          <input
            id="color-picker"
            type="color"
            :value="color"
            @input="colorInput"
          />
          <input type="text" :value="color" @input="colorInput" />
          <slot name="extra-input"></slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.editable-container {
  display: flex;
  flex-direction: row;
}
.color-container {
  position: relative;
  .pencil,
  .delete {
    visibility: visible;
    opacity: 0;
    transition: 0.3s;
  }
}
.color-container:hover {
  .pencil,
  .delete {
    visibility: visible;
    opacity: 1;
    transition: 0.3s;
  }
}
.pencil {
  color: v-bind(textColor);
  cursor: pointer;
  position: absolute;
  top: 1.5em;
  left: 1.5em;
  width: 2em;
  height: 2em;
  border-radius: 1em;
  background: none;
  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: 0.3s;
  }
}

.pencil:hover svg {
  transform: translate(-50%, -50%) rotate(-15deg);
  transition: 0.3s;
}
.delete {
  color: v-bind(textColor);
  cursor: pointer;
  position: absolute;
  top: 1.5em;
  right: 1.5em;
  width: 2em;
  height: 2em;
  border-radius: 1em;
  background: none;
  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: 0.3s;
    fill: none;
  }
}

.delete:hover svg {
  transform: translate(-50%, -50%) scale(1.2);
  transition: 0.3s;
}
.hidden {
  visibility: hidden;
}
.color-inputs {
  margin: 1em;
  display: flex;
  flex-direction: column;
  width: 12em;
  input {
    width: auto;
    text-transform: uppercase;
    margin: 0.25em 0;
    font-size: 2em;
    text-align: center;
  }
}
</style>
