import assert from "node:assert/strict";
import fs from "node:fs";

const file = "tools/media/image-format-converter.html";
const html = fs.readFileSync(file, "utf8");
const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || "";
const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || "";
const article = html.match(/<section class="tool-guide"[\s\S]*?<\/section>/i)?.[0] || "";
const articleText = article.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const schemaDescriptions = [...html.matchAll(/"description":\s*"([^"]*)"/g)].map((match) => match[1]);
const badTemplate = /大段文字格式错乱|日期时区|音视频媒体工具|适用于 media|无缝对接工作流/;

assert.ok(title.length >= 30 && title.length <= 60, "title should have useful search length");
assert.match(title, /图片格式转换|PNG|JPG|WebP/i, "title should target format conversion intent");
assert.doesNotMatch(title, /…|\.\.\./, "title should not be truncated");
assert.ok(description.length >= 120 && description.length <= 160, "description length");
assert.match(description, /图片格式转换|PNG|JPG|WebP/i, "description should target format conversion intent");
assert.doesNotMatch(description, badTemplate, "description should not use template copy");
assert.equal((html.match(/<h1\b/gi) || []).length, 1, "one h1");
assert.equal((html.match(/<nav\s+class="breadcrumb"/gi) || []).length, 1, "one visible breadcrumb");
assert.ok([...articleText].filter((char) => /[\u3400-\u9fff]/.test(char)).length >= 1200, "guide content depth");
for (const href of [
  "/tools/media/image-compressor",
  "/tools/media/image-resize",
  "/tools/media/image-crop",
  "/tools/media/image-blur",
]) {
  assert.match(html, new RegExp(`href="${href}"`, "i"), `${href} internal link`);
}
for (const id of ["targetFormat", "quality", "qualityVal", "maxWidth", "maxHeight", "btnConvert"]) {
  assert.match(html, new RegExp(`id="${id}"`, "i"), `${id} control`);
}
assert.ok(schemaDescriptions.every((value) => !badTemplate.test(value)), "schema descriptions should be specific");

console.log("PASS image-format-converter SEO and controls checks");
