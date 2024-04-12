<script setup>
import { watch } from "vue";
import chroma from "../color.js";
import ColorRow from "@/components/ColorRow.vue";
import Color from "@/components/ColorSquare.vue";
import EditableColor from "@/components/EditableColor.vue";
import AddButton from "@/components/AddButton.vue";
import Copyable from "@/components/ClipboardCopy.vue";

import { constants, useColorStore } from "@/store.js";

// access the `store` variable anywhere in the component ✨
const store = useColorStore();

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
    ctx.fillStyle =
      store.tonesColors[Math.ceil(store.tonesColors.length / 2)].hex();
    ctx.fillRect(16, 0, 16, 16);

    // [ ][ ]
    // [x][ ]
    ctx.fillStyle = store.grays[Math.floor(store.grays.length / 2)].color.hex();
    ctx.fillRect(0, 16, 16, 16);

    // [ ][ ]
    // [ ][x]
    ctx.fillStyle = store.tonesColors[1].hex();
    ctx.fillRect(16, 16, 16, 16);

    const link = document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    link.href = canvas.toDataURL("image/x-icon");
    document.getElementsByTagName("head")[0].appendChild(link);
  };
}

function createPreset() {
  return createState(["baseColor"]);
}

function savePreset(name) {
  if (name !== undefined && name !== null && name.length > 0) {
    const presetStr = JSON.stringify(createPreset());
    localStorage.setItem(`PRESET_${name}`, presetStr);
    store.newPresetName = "";
  }
}

function getAllPresetNames() {
  return Object.keys(localStorage)
    .filter((k) => k.startsWith("PRESET_"))
    .map((k) => k.slice(7));
}

function loadPreset(name) {
  let presetStr;
  if (name !== null && name !== undefined) {
    presetStr = localStorage.getItem(`PRESET_${name}`);
  }
  if (presetStr !== null && presetStr !== undefined) {
    const preset = JSON.parse(presetStr);
    load(preset);
  } else {
    store.grays = constants.defaultGrays;
    store.palette = constants.defaultPalette;
    store.activeColorSpaces = constants.defaultActiveColorSpaces;
    store.grayRatio = constants.defaultGrayRatio;
  }
}

function exportData() {
  const state = createState([
    "showGrays",
    "showLumAdjusted",
    "showShades",
    "showTints",
    "showPalette",
    "showTones",
    "palette",
    "shades",
    "tints",
  ]);
  const exData = {
    ...state,
    adjustedLuminance: store.lumAdjusted.map((c) => c.hex()),
    tonesColors: store.tonesColors.map((c) => c.hex()),
    colorPalette: store.colorPalette.map((c, i) =>
      Object.assign({ color: c.hex(), value: store.palette[i] }),
    ),
    shadesColors: store.shadesColors.map((c, i) =>
      Object.assign({ color: c.hex(), value: store.shades[i] }),
    ),
    tintsColors: store.tintsColors.map((c, i) =>
      Object.assign({ color: c.hex(), value: store.tints[i] }),
    ),
  };
  return JSON.stringify(exData, null, 4);
}

function createState(exclude) {
  let state = {
    baseColor: store.baseColor.hex(),
    grays: store.grays.map((g) =>
      Object.assign({ color: g.color.hex(), ratioFactor: g.ratioFactor }),
    ),
    palette: store.palette,
    shades: store.shades,
    tints: store.tints,
    activeColorSpaces: store.activeColorSpaces,
    grayRatio: store.grayRatio,
    showGrays: store.showGrays,
    showLumAdjusted: store.showLumAdjusted,
    showShades: store.showShades,
    showTints: store.showTints,
    showPalette: store.showPalette,
    showTones: store.showTones,
  };
  if (exclude !== undefined) {
    state = Object.fromEntries(
      Object.entries(state).filter(([key]) => !exclude.includes(key)),
    );
  }

  return state;
}

function saveState() {
  const stateStr = JSON.stringify(createState());
  localStorage.setItem("_STATE_", stateStr);
}

function loadState() {
  const stateStr = localStorage.getItem("_STATE_");

  if (stateStr !== null && stateStr !== undefined) {
    const state = JSON.parse(stateStr);
    load(state);
  }
}

function load(state) {
  store.baseColor = chroma(state.baseColor || store.baseColor);
  store.palette = state.palette || store.palette;
  store.grays =
    state.grays === undefined
      ? store.grays
      : state.grays.map((g) =>
          Object.assign({ color: chroma(g.color), ratioFactor: g.ratioFactor }),
        );
  store.shades = state.shades || store.shades;
  store.tints = state.tints || store.tints;
  store.activeColorSpaces = state.activeColorSpaces || store.activeColorSpaces;
  store.grayRatio = state.grayRatio || store.grayRatio;
  store.showGrays =
    state.showGrays === undefined ? store.showGrays : state.showGrays;
  store.showLumAdjusted =
    state.showLumAdjusted === undefined
      ? store.showLumAdjusted
      : state.showLumAdjusted;
  store.showShades =
    state.showShades === undefined ? store.showShades : state.showShades;
  store.showTints =
    state.showTints === undefined ? store.showTints : state.showTints;
  store.showPalette =
    state.showPalette === undefined ? store.showPalette : state.showPalette;
  store.showTones =
    state.showTones === undefined ? store.showTones : state.showTones;
}

loadPreset();
savePreset("default");
loadState();
updateFavicon();
watch(store.$state, updateFavicon);
watch(store.$state, saveState);
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
          v-model="store.showPalette"
        />
      </div>
      <div>
        <label for="show-shades" class="show-hide-label">Show shades</label>
        <input
          id="show-shades"
          type="checkbox"
          class="show-hide-checkbox"
          v-model="store.showShades"
        />
      </div>
      <div>
        <label for="show-tints" class="show-hide-label">Show tints</label>
        <input
          id="show-tints"
          type="checkbox"
          class="show-hide-checkbox"
          v-model="store.showTints"
        />
      </div>
      <div>
        <label for="show-grays" class="show-hide-label">Show grays</label>
        <input
          id="show-grays"
          type="checkbox"
          class="show-hide-checkbox"
          v-model="store.showGrays"
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
          v-model="store.showLumAdjusted"
        />
      </div>
      <div>
        <label for="show-tones" class="show-hide-label">Show gray tones</label>
        <input
          id="show-tones"
          type="checkbox"
          class="show-hide-checkbox"
          v-model="store.showTones"
        />
      </div>
    </div>
    <div class="configs presets">
      <div>
        <input type="text" id="preset-name" v-model="store.newPresetName" />
        <button
          :disabled="!store.newPresetName"
          @click="() => savePreset(store.newPresetName)"
        >
          Save preset
        </button>
      </div>
      <div class="select-preset-container">
        <select id="load-preset" v-model="store.selectedPresetName">
          <option
            v-for="(p, index) in getAllPresetNames()"
            :key="index"
            :value="p"
          >
            {{ p }}
          </option>
        </select>
        <button @click="() => loadPreset(store.selectedPresetName)">
          Load preset
        </button>
      </div>
      <Copyable
        :content="exportData()"
        :hide-content="true"
        color="black"
        bg-color="white"
      >
        <button class="copy-button">Copy as JSON</button>
      </Copyable>
    </div>
  </ColorRow>
  <div v-show="store.showPalette">
    <ColorRow title="Material Palette" :has-settings="false">
      <EditableColor
        class="deletable"
        v-for="(k, i) in Object.keys(store.colorPalette)"
        :show="false"
        :color="store.colorPalette[k]"
        :delete-func="() => store.deleteValue(store.palette, i)"
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
              v-model="store.palette[i]"
            />
          </div>
        </template>
        <template #color-slot>
          <div>Primary-{{ store.palette[i] }}</div>
        </template>
      </EditableColor>
      <AddButton :add-func="() => store.palette.push(0)" />
    </ColorRow>
  </div>
  <div v-show="store.showShades">
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
        v-for="(c, i) in store.shadesColors"
        :color="store.shadesColors[i]"
        :show="false"
        :id="'shades-' + i"
        :delete-func="() => store.deleteValue(store.shades, i)"
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
              v-model="store.shades[i]"
            />
          </div>
        </template>
      </EditableColor>
      <AddButton :add-func="() => store.shades.push(0)" />
    </ColorRow>
  </div>
  <div v-show="store.showTints">
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
        v-for="(c, i) in store.tintsColors"
        :color="store.tintsColors[i]"
        :show="false"
        :id="'tints-' + i"
        :delete-func="() => store.deleteValue(store.tints, i)"
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
              v-model="store.tints[i]"
            />
          </div>
        </template>
      </EditableColor>
      <AddButton :add-func="() => store.tints.push(0)" />
    </ColorRow>
  </div>
  <div v-show="store.showGrays">
    <ColorRow title="Grays">
      <EditableColor
        :show="false"
        v-for="(c, i) in store.grays"
        v-model:color="store.grays[i].color"
        :id="'grays-' + i"
        :delete-func="() => store.deleteValue(store.grays, i)"
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
              @input="(e) => store.setGrayRatioFactor(e, i)"
              :value="store.grays[i].ratioFactor"
            />
          </div>
        </template>
      </EditableColor>
      <AddButton :add-func="store.addGray" />
    </ColorRow>
  </div>
  <div v-show="store.showLumAdjusted">
    <ColorRow
      title="Gray-Adjusted Luminance"
      :info="'Base color with luminance value set to corresponding Gray'"
    >
      <Color
        v-for="(c, i) in store.lumAdjusted"
        :color="store.lumAdjusted[i]"
        :key="i"
      />
    </ColorRow>
  </div>
  <div v-show="store.showTones">
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
        v-for="(mc, i) in store.tonesColors"
        :color="store.tonesColors[i]"
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
