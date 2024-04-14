<script setup>
import { ref, watch } from "vue";
import { deleteCache } from "../color.js";
import ColorRow from "@/components/ColorRow.vue";
import Color from "@/components/ColorSquare.vue";
import EditableColor from "@/components/EditableColor.vue";
import AddButton from "@/components/AddButton.vue";
import Copyable from "@/components/ClipboardCopy.vue";

import { constants, useColorStore } from "@/store.js";
import { getStateHandler } from "@/state.js";

// access the `store` variable anywhere in the component ✨
const store = useColorStore();
const { state, presets } = getStateHandler(store);

const newPresetName = ref("");
const selectedPresetName = ref("default");

function updateFavicon() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = "/colormachine/favicon.ico";
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    // [x][ ]
    // [ ][ ]
    ctx.fillStyle = store.baseColor.hex();
    ctx.fillRect(0, 0, 16, 16);

    // [ ][x]
    // [ ][ ]
    ctx.fillStyle = store.tones[0] ? store.tones[0].color.hex() : "#ff0000";
    ctx.fillRect(16, 0, 16, 16);

    // [ ][ ]
    // [x][ ]
    ctx.fillStyle = store.grays[0] ? store.grays[0].color.hex() : "#00ff00";
    ctx.fillRect(0, 16, 16, 16);

    // [ ][ ]
    // [ ][x]
    ctx.fillStyle = store.shades[0] ? store.shades[0].color.hex() : "#0000ff";
    ctx.fillRect(16, 16, 16, 16);

    const link = document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    link.href = canvas.toDataURL("image/x-icon");
    document.getElementsByTagName("head")[0].appendChild(link);
  };
}

presets.saveAs("default");

state.loadFromStorage();
state.saveToStorage();

updateFavicon();
watch(store.$state, updateFavicon);
watch(store.baseColor, deleteCache);
watch(store.state, () => state.saveToStorage());
</script>

<template>
  <h1>ColorMachine</h1>
  <ColorRow title="Base color">
    <EditableColor
      v-model:color="store.baseColor"
      :hidePencil="true"
      :hide-delete="true"
    />
    <div class="configs">
      <div>
        <label for="show-palette" class="show-hide-label"
          >Show material palette</label
        >
        <input
          id="show-palette"
          type="checkbox"
          class="show-hide-checkbox"
          v-model="store.visibility.palette"
        />
      </div>
      <div>
        <label for="show-shades" class="show-hide-label">Show shades</label>
        <input
          id="show-shades"
          type="checkbox"
          class="show-hide-checkbox"
          v-model="store.visibility.shades"
        />
      </div>
      <div>
        <label for="show-tints" class="show-hide-label">Show tints</label>
        <input
          id="show-tints"
          type="checkbox"
          class="show-hide-checkbox"
          v-model="store.visibility.tints"
        />
      </div>
      <div>
        <label for="show-grays" class="show-hide-label">Show grays</label>
        <input
          id="show-grays"
          type="checkbox"
          class="show-hide-checkbox"
          v-model="store.visibility.grays"
        />
      </div>
      <div>
        <label for="show-lum-adj" class="show-hide-label"
          >Show gray-adjusted luminance</label
        >
        <input
          id="show-lum-adj"
          type="checkbox"
          class="show-hide-checkbox"
          v-model="store.visibility.lumAdjusted"
        />
      </div>
      <div>
        <label for="show-tones" class="show-hide-label">Show gray tones</label>
        <input
          id="show-tones"
          type="checkbox"
          class="show-hide-checkbox"
          v-model="store.visibility.tones"
        />
      </div>
    </div>
    <div class="configs presets">
      <div>
        <input type="text" id="preset-name" v-model="newPresetName" />
        <button
          :disabled="!newPresetName"
          @click="() => presets.saveAs(newPresetName)"
        >
          Save preset
        </button>
      </div>
      <div class="select-preset-container">
        <select id="load-preset" v-model="selectedPresetName">
          <option
            v-for="(p, index) in presets.allNames()"
            :key="index"
            :value="p"
          >
            {{ p }}
          </option>
        </select>
        <button @click="() => presets.load(selectedPresetName)">
          Load preset
        </button>
      </div>
      <Copyable
        :content="JSON.stringify(state.export())"
        :hide-content="true"
        color="black"
        bg-color="white"
      >
        <button class="copy-button">Copy as JSON</button>
      </Copyable>
    </div>
  </ColorRow>
  <div v-if="store.visibility.palette">
    <ColorRow title="Material Palette" :has-settings="false">
      <EditableColor
        class="deletable"
        v-for="(p, i) in store.palette"
        :show="false"
        :color="store.palette[i].color"
        :delete-func="() => store.palette.delete(i)"
        :id="'palette-' + i"
        :key="i"
      >
        <template #inputs>
          <div class="color-value">
            <label :for="'palette-val-' + i">Value</label>
            <input
              class="palette-val"
              type="number"
              min="0"
              max="1000"
              step="50"
              :id="'palette-val-' + i"
              v-model="store.paletteValues[i]"
            />
          </div>
        </template>
        <template #color-slot>
          <div>Primary-{{ store.paletteValues[i] }}</div>
        </template>
      </EditableColor>
      <AddButton :add-func="() => store.palette.add()" />
    </ColorRow>
  </div>
  <div v-if="store.visibility.shades">
    <ColorRow
      :title="`Shades (${store.activeColorSpaces.shades.toUpperCase()})`"
      :has-settings="true"
    >
      <template #settings>
        <div>
          <label for="colorspace">Colormode:</label>
          <select id="colorspace" v-model="store.activeColorSpaces.shades">
            <option
              v-for="(cs, index) in constants.colorSpaces"
              :key="index"
              :value="cs"
            >
              {{ cs.toUpperCase() }}
            </option>
          </select>
        </div>
      </template>
      <EditableColor
        v-for="(c, i) in store.shades"
        :color="store.shades[i].color"
        :show="false"
        :id="'shades-' + i"
        :delete-func="() => store.shades.delete(i)"
        :key="i"
      >
        <template #inputs>
          <div class="color-value">
            <label :for="'shades-val-' + i">Value</label>
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              :id="'shades-val-' + i"
              v-model="store.shadesValues[i]"
            />
          </div>
        </template>
      </EditableColor>
      <AddButton :add-func="() => store.shades.add()" />
    </ColorRow>
  </div>
  <div v-if="store.visibility.tints">
    <ColorRow
      :title="`Tints (${store.activeColorSpaces.tints.toUpperCase()})`"
      :has-settings="true"
    >
      <template #settings>
        <label for="colorspace">Colormode:</label>
        <select id="colorspace" v-model="store.activeColorSpaces.tints">
          <option
            v-for="(cs, index) in constants.colorSpaces"
            :key="index"
            :value="cs"
          >
            {{ cs.toUpperCase() }}
          </option>
        </select>
      </template>
      <EditableColor
        v-for="(c, i) in store.tints"
        :color="store.tints[i].color"
        :show="false"
        :id="'tints-' + i"
        :delete-func="() => store.tints.delete(i)"
        :key="i"
      >
        <template #inputs>
          <div class="color-value">
            <label :for="'tints-val-' + i">Value</label>
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              :id="'tints-val-' + i"
              v-model="store.tintsValues[i]"
            />
          </div>
        </template>
      </EditableColor>
      <AddButton :add-func="() => store.tints.add()" />
    </ColorRow>
  </div>
  <div v-if="store.visibility.grays">
    <ColorRow title="Grays">
      <EditableColor
        :show="false"
        v-for="(c, i) in store.grays"
        v-model:color="store.grays[i].color"
        :id="'grays-' + i"
        :delete-func="() => store.grays.delete(i)"
        :key="i"
      >
        <template #extra-input>
          <div>
            <label :for="'grayratio-factor-' + i">Gray ratio factor</label>
            <input
              class="ratio-factor"
              type="number"
              step="0.1"
              min="0"
              max="1"
              :id="'grayratio-factor-' + i"
              @input="(e) => store.grays.setRatioFactor(e, i)"
              :value="store.graysValues[i].ratioFactor"
            />
          </div>
        </template>
      </EditableColor>
      <AddButton :add-func="() => store.grays.add()" />
    </ColorRow>
  </div>
  <div v-if="store.visibility.lumAdjusted">
    <ColorRow
      title="Gray-Adjusted Luminance"
      :info="'Base color with luminance value set to corresponding Gray'"
    >
      <Color
        v-for="(c, i) in store.lumAdjusted"
        :color="store.lumAdjusted[i].color"
        :key="i"
      />
    </ColorRow>
  </div>
  <div v-if="store.visibility.tones">
    <ColorRow
      :title="`Gray Tones (${store.activeColorSpaces.tones.toUpperCase()})`"
      :has-settings="true"
      :info="'Computed by interpolating Gray-Adjusted Luminance and Grays'"
    >
      <template #settings>
        <div>
          <label for="grayratio-slider">Gray ratio:</label>
          <input
            id="grayratio-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model="store.grayRatio"
            class="slider"
          />
          <input
            id="grayratio-text"
            type="text"
            v-model="store.grayRatio"
            style="width: 50px"
          />
        </div>
        <div>
          <label for="colorspace">Colormode:</label>
          <select id="colorspace" v-model="store.activeColorSpaces.tones">
            <option
              v-for="(cs, index) in constants.colorSpaces"
              :key="index"
              :value="cs"
            >
              {{ cs.toUpperCase() }}
            </option>
          </select>
        </div>
      </template>
      <Color
        v-for="(mc, i) in store.tones"
        :color="store.tones[i].color"
        :key="i"
      />
    </ColorRow>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

.color-value {
  margin: 1em;
  display: flex;
  flex-direction: column;

  input {
    margin: 0.25em;
    width: 5em;
  }
}

.configs {
  display: flex;
  flex-direction: column;
  margin: 2em;
}

.show-hide-checkbox {
  height: fit-content;
  margin: 0.5em 0.5em 0;
}

.presets {
  input,
  select,
  button {
    margin: 0.25em;
  }
  select {
    flex-grow: 1;
    height: 2em;
  }

  button {
    width: fit-content;
    height: 2em;
  }
}

.select-preset-container {
  display: flex;
  flex-direction: row;
  width: 100%;
}
</style>
