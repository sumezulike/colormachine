import {
  argbFromHex,
  hexFromArgb,
  TonalPalette,
} from "@material/material-color-utilities";
import chroma_ from "chroma-js";
import colornames from "@/assets/colornames.json";

chroma_.Color.prototype.hct = function () {
  return TonalPalette.fromInt(argbFromHex(this.hex()));
};

chroma_.fromHct = function (c) {
  return chroma_(hexFromArgb(c));
};

chroma_.Color.prototype.setHCT = function (hct = {}) {
  let hctCol = this.hct();
  if (hct.h !== undefined) {
    hctCol = hctCol.hue(hct.h);
  }
  if (hct.c !== undefined) {
    hctCol = hctCol.chroma(hct.c);
  }
  if (hct.t !== undefined) {
    hctCol = hctCol.tone(hct.t);
  }
  return chroma_.fromHct(hctCol);
};

function _getClosestColor(c) {
  let closest = "";
  let minDist = 10000000;
  for (const [hex, name] of Object.entries(colornames)) {
    const newDist = chroma_.deltaE(c, hex);
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
let cache = {};

function memoize(fn) {
  return (...args) => {
    const n = args[0];
    if (n in cache) {
      return cache[n];
    } else {
      const result = fn(n);
      cache[n] = result;
      return result;
    }
  };
}

export function deleteColorNameCache() {
  cache = {};
}

export const getClosestColor = memoize(_getClosestColor);

export const chroma = chroma_;
