import { s as styles_default, b as stateRenderer_v3_unified_default, a as stateDiagram_default, S as StateDB } from "./chunk-DI55MBZ5-wOLz-e4v.js";
import { _ as __name } from "./mermaid.core-mHttblf5.js";
import "./chunk-55IACEB6-DuZXCYV-.js";
import "./chunk-QN33PNHL-CwLZE7T8.js";
import "./index.ts-CJEaNC9h.js";
import "./storage-G_NSCLrW.js";
var diagram = {
  parser: stateDiagram_default,
  get db() {
    return new StateDB(2);
  },
  renderer: stateRenderer_v3_unified_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    if (!cnf.state) {
      cnf.state = {};
    }
    cnf.state.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
  }, "init")
};
export {
  diagram
};
//# sourceMappingURL=stateDiagram-v2-4FDKWEC3-BVH6FLC3.js.map
