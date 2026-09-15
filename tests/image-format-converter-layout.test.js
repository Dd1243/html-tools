import assert from "node:assert/strict";
import fs from "node:fs";

const file = "tools/media/image-format-converter.html";
const html = fs.readFileSync(file, "utf8");
const breadcrumbs = html.match(/<nav\s+class="breadcrumb"/gi) || [];

assert.strictEqual(
  breadcrumbs.length,
  1,
  `${file} should render exactly one visible breadcrumb navigation`
);

console.log("PASS image-format-converter renders one breadcrumb");
