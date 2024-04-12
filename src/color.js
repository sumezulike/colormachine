import {
  argbFromHex,
  hexFromArgb,
  TonalPalette,
} from "@material/material-color-utilities";
import chroma from "chroma-js";

chroma.Color.prototype.hct = function () {
  return TonalPalette.fromInt(argbFromHex(this.hex()));
};

chroma.fromHct = function (c) {
  return chroma(hexFromArgb(c));
};

chroma.Color.prototype.setHCT = function (hct = {}) {
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
  return chroma.fromHct(hctCol);
};

export default chroma;
