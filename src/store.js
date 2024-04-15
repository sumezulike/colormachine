import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { chroma } from "./color.js";
import { clamp, isFloat } from "@/utils.js";

export const constants = {
  colorSpaces: ["rgb", "hsl", "lab", "lch", "lrgb"],
  defaultPalette: [800, 500, 400, 200, 50],
  defaultShades: [10, 30, 50, 70, 90],
  defaultTints: [10, 30, 50, 70, 90],
  defaultGrays: [
    { color: "#262626", ratioFactor: 1.0 },
    { color: "#777777", ratioFactor: 1.0 },
    { color: "#b5b5b5", ratioFactor: 0.95 },
    { color: "#e3e3e3", ratioFactor: 0.8 },
    { color: "#f6f6f6", ratioFactor: 0.3 },
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
  baseColor.value.repr = () => baseColor.value.hex();
  const graysValues = ref(constants.defaultGrays);
  const paletteValues = ref(constants.defaultPalette);
  const shadesValues = ref(constants.defaultShades);
  const tintsValues = ref(constants.defaultTints);
  const activeColorSpaces = ref(constants.defaultActiveColorSpaces);
  const grayRatio = ref(constants.defaultGrayRatio);
  const visibility = reactive({
    grays: false,
    shades: false,
    tints: false,
    lumAdjusted: false,
    palette: false,
    tones: true,
  });

  // Computed
  const grays = computed(() => {
    const grays = graysValues.value.map((g) =>
      Object.assign({
        color: chroma(g.color),
        ratioFactor: g.ratioFactor,
      }),
    );
    grays.add = (c = "white", r = 1.0) =>
      graysValues.value.push({ color: chroma(c), ratioFactor: r });
    grays.delete = (i) => graysValues.value.splice(i, 1);
    grays.setRatioFactor = (e, i) => {
      const newFactor = e.target.value;
      if (isFloat(newFactor)) {
        const f = parseFloat(newFactor);
        graysValues.value[i].ratioFactor = clamp(0, f, 1);
      }
    };
    grays.repr = () =>
      grays.map((g) =>
        Object.assign({ color: g.color.hex(), ratioFactor: g.ratioFactor }),
      );
    return grays;
  });
  const lumAdjusted = computed(() => {
    const lumAdjusted = grays.value.map((g) =>
      Object.assign({
        color: baseColor.value.luminance(g.color.luminance()),
      }),
    );
    lumAdjusted.repr = () =>
      lumAdjusted.map((l) => Object.assign({ color: l.color.hex() }));
    return lumAdjusted;
  });
  const tones = computed(() => {
    const tones = graysValues.value.map((g, i) =>
      Object.assign({
        color: chroma.mix(
          lumAdjusted.value[i].color,
          g.color,
          grayRatio.value * g.ratioFactor,
          activeColorSpaces.value.tones,
        ),
      }),
    );
    tones.repr = () =>
      tones.map((t) => Object.assign({ color: t.color.hex() }));
    return tones;
  });
  const palette = computed(() => {
    const palette = paletteValues.value.map((t) =>
      Object.assign({
        value: t,
        color: baseColor.value.setHCT({ t: 100 - t / 10 }),
      }),
    );
    palette.add = (v = 500) => paletteValues.value.push(v);
    palette.delete = (i) => paletteValues.value.splice(i, 1);
    palette.repr = () =>
      palette.map((p) =>
        Object.assign({ color: p.color.hex(), value: p.value }),
      );
    return palette;
  });
  const shades = computed(() => {
    const shades = shadesValues.value.map((v) =>
      Object.assign({
        value: v,
        color: chroma.mix(
          baseColor.value,
          "black",
          v / 100,
          activeColorSpaces.value.shades,
        ),
      }),
    );
    shades.add = (v = 50) => shadesValues.value.push(v);
    shades.delete = (i) => shadesValues.value.splice(i, 1);
    shades.repr = () =>
      shades.map((s) =>
        Object.assign({ color: s.color.hex(), value: s.value }),
      );
    return shades;
  });
  const tints = computed(() => {
    const tints = tintsValues.value.map((w) =>
      Object.assign({
        value: w,
        color: chroma.mix(
          baseColor.value,
          "white",
          w / 100,
          activeColorSpaces.value.tints,
        ),
      }),
    );
    tints.add = (v = 50) => tintsValues.value.push(v);
    tints.delete = (i) => tintsValues.value.splice(i, 1);
    tints.repr = () =>
      tints.map((t) => Object.assign({ color: t.color.hex(), value: t.value }));
    return tints;
  });

  const state = reactive({
    version: "2.0",
    baseColor: computed(() => baseColor.value.hex()),
    graysValues,
    paletteValues,
    shadesValues,
    tintsValues,
    activeColorSpaces,
    grayRatio,
    visibility,
    grays,

    lumAdjusted,
    tones,
    palette,
    shades,
    tints,
  });

  return {
    baseColor,
    graysValues,
    paletteValues,
    shadesValues,
    tintsValues,
    activeColorSpaces,
    grayRatio,
    visibility,
    grays,
    lumAdjusted,
    tones,
    palette,
    shades,
    tints,

    state,
  };
});
