import assert from "node:assert/strict";
import fs from "node:fs";

const file = "tools/media/image-resize.html";
const html = fs.readFileSync(file, "utf8");

for (const id of ["fileInput", "dropArea", "targetWidth", "targetHeight", "lockRatio", "targetFormat", "quality"]) {
  assert.match(html, new RegExp(`id="${id}"`, "i"), `${id} control must be rendered`);
}
assert.match(html, /点击或拖拽图片到此处|选择图片|上传图片/, "page must clearly expose an upload action");
assert.match(html, /\.upload-box\s*\{[^}]*display\s*:\s*(?:block|flex|grid)\s*;/i, "upload label must be block-level so its border remains continuous");
assert.equal((html.match(/<nav\s+class="breadcrumb"/gi) || []).length, 1, "page should have one breadcrumb");

console.log("PASS image-resize upload controls are present");
