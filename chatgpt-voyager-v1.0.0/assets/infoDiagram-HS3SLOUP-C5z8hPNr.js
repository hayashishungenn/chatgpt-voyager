import { _ as __name, l as log, H as selectSvgElement, e as configureSvgSize, I as package_default } from "./mermaid.core-mHttblf5.js";
import { p as parse } from "./treemap-GDKQZRPO-f2iOl2SH.js";
import "./index.ts-CJEaNC9h.js";
import "./storage-G_NSCLrW.js";
import "./_baseUniq-eR8-2dxm.js";
import "./_basePickBy-DDCPv3Hi.js";
import "./clone-Bac-2uLi.js";
var parser = {
  parse: /* @__PURE__ */ __name(async (input) => {
    const ast = await parse("info", input);
    log.debug(ast);
  }, "parse")
};
var DEFAULT_INFO_DB = {
  version: package_default.version + ""
};
var getVersion = /* @__PURE__ */ __name(() => DEFAULT_INFO_DB.version, "getVersion");
var db = {
  getVersion
};
var draw = /* @__PURE__ */ __name((text, id, version) => {
  log.debug("rendering info diagram\n" + text);
  const svg = selectSvgElement(id);
  configureSvgSize(svg, 100, 400, true);
  const group = svg.append("g");
  group.append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${version}`);
}, "draw");
var renderer = { draw };
var diagram = {
  parser,
  db,
  renderer
};
export {
  diagram
};
//# sourceMappingURL=infoDiagram-HS3SLOUP-C5z8hPNr.js.map
