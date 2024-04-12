import { defineStore } from "pinia";
import { computed, ref } from "vue";
import chroma from "./color.js";
import { clamp, isFloat } from "@/utils.js";

export const constants = {
  colorSpaces: ["rgb", "hsl", "lab", "lch", "lrgb"],
  defaultPalette: [800, 500, 400, 200, 50],
  defaultShades: [10, 30, 50, 70, 90],
  defaultTints: [10, 30, 50, 70, 90],
  defaultGrays: [
    { color: chroma("#262626"), ratioFactor: 1.0 },
    { color: chroma("#777777"), ratioFactor: 1.0 },
    { color: chroma("#b5b5b5"), ratioFactor: 0.95 },
    { color: chroma("#e3e3e3"), ratioFactor: 0.8 },
    { color: chroma("#f6f6f6"), ratioFactor: 0.3 },
  ],
  defaultActiveColorSpaces: {
    tones: "hsl",
    shades: "hsl",
    tints: "hsl",
  },
  defaultGrayRatio: 0.9,
};

export const useColorStore = defineStore("color", () => {
  // Mutable
  const baseColor = ref(chroma.random());
  const grays = ref(constants.defaultGrays);
  const palette = ref(constants.defaultPalette);
  const shades = ref(constants.defaultShades);
  const tints = ref(constants.defaultTints);
  const activeColorSpaces = ref(constants.defaultActiveColorSpaces);
  const grayRatio = ref(constants.defaultGrayRatio);
  const showGrays = ref(false);
  const showShades = ref(false);
  const showTones = ref(true);
  const showTints = ref(false);
  const showLumAdjusted = ref(false);
  const showPalette = ref(false);
  const newPresetName = ref("");
  const selectedPresetName = ref("default");

  // Computed
  const lumAdjusted = computed(() =>
    grays.value.map((g) => baseColor.value.luminance(g.color.luminance())),
  );
  const tonesColors = computed(() =>
    grays.value.map((g, i) =>
      chroma.mix(
        lumAdjusted.value[i],
        g.color,
        grayRatio.value * g.ratioFactor,
        activeColorSpaces.value.tones,
      ),
    ),
  );
  const colorPalette = computed(() =>
    palette.value.map((t) => baseColor.value.setHCT({ t: 100 - t / 10 })),
  );
  const shadesColors = computed(() =>
    shades.value.map((w) =>
      chroma.mix(
        baseColor.value,
        "black",
        w / 100,
        activeColorSpaces.value.shades,
      ),
    ),
  );
  const tintsColors = computed(() =>
    tints.value.map((w) =>
      chroma.mix(
        baseColor.value,
        "white",
        w / 100,
        activeColorSpaces.value.tints,
      ),
    ),
  );
  function addGray() {
    grays.value.push({ color: chroma("white"), ratioFactor: 1.0 });
  }
  function deleteValue(array, i) {
    array.splice(i, 1);
  }
  function setGrayRatioFactor(e, i) {
    const newFactor = e.target.value;
    if (isFloat(newFactor)) {
      const f = parseFloat(newFactor);
      grays.value[i].ratioFactor = clamp(0, f, 1);
    }
  }
  return {
    baseColor,
    grays,
    palette,
    shades,
    tints,
    activeColorSpaces,
    grayRatio,
    showGrays,
    showShades,
    showTones,
    showTints,
    showLumAdjusted,
    showPalette,
    newPresetName,
    selectedPresetName,
    lumAdjusted,
    tonesColors,
    colorPalette,
    shadesColors,
    tintsColors,

    addGray,
    deleteValue,
    setGrayRatioFactor,
  };
});
