import { s as styles_default, c as classRenderer_v3_unified_default, a as classDiagram_default, C as ClassDB } from "./chunk-B4BG7PRW-BwlzSDw5.js";
import { _ as __name } from "./mermaid.core-mHttblf5.js";
import "./chunk-FMBD7UC4-CXUA86L7.js";
import "./chunk-55IACEB6-DuZXCYV-.js";
import "./chunk-QN33PNHL-CwLZE7T8.js";
import "./index.ts-CJEaNC9h.js";
import "./storage-G_NSCLrW.js";
var diagram = {
  parser: classDiagram_default,
  get db() {
    return new ClassDB();
  },
  renderer: classRenderer_v3_unified_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    if (!cnf.class) {
      cnf.class = {};
    }
    cnf.class.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
  }, "init")
};
export {
  diagram
};
//# sourceMappingURL=classDiagram-2ON5EDUG-DR0HRfgH.js.map
