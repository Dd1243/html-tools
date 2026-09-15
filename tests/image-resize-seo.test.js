import assert from "node:assert/strict";
import fs from "node:fs";

const file = "tools/media/image-resize.html";
const html = fs.readFileSync(file, "utf8");
const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || "";
const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || "";
const guide = html.match(/<section class="tool-guide"[\s\S]*?<\/section>/i)?.[0] || "";
const guideText = guide.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const schemaTypes = [...html.matchAll(/"@type":\s*"([^"]+)"/g)].map((match) => match[1]);
const schemaDescriptions = [...html.matchAll(/"description":\s*"([^"]*)"/g)].map((match) => match[1]);

assert.ok(title.length >= 28 && title.length <= 60, "title should be concise and descriptive");
assert.match(title, /图片尺寸|调整图片|图片缩放/, "title should target image resize intent");
assert.ok(description.length >= 120 && description.length <= 160, "description should fit search snippet length");
assert.match(description, /图片尺寸|调整图片|图片缩放/, "description should target image resize intent");
assert.doesNotMatch(description, /音视频媒体工具|持续更新的实用小工具合集|适用于 media/, "description should be page-specific");
assert.equal((html.match(/<h1\b/gi) || []).length, 1, "page should have one h1");
assert.match(html, /"@type":\s*"WebApplication"/, "page should expose WebApplication schema");
assert.match(html, /"name":\s*"在线图片尺寸修改工具"/, "schema name should match the tool");
assert.doesNotMatch(html, /"name":\s*"图片压缩对比"/, "breadcrumb schema must not use another tool name");
assert.ok(schemaTypes.includes("BreadcrumbList"), "breadcrumb schema should remain present");
assert.ok(schemaDescriptions.every((value) => !/音视频媒体工具|适用于 media/.test(value)), "schema descriptions should be specific");
assert.ok([...guideText].filter((char) => /[\u3400-\u9fff]/.test(char)).length >= 1800, "guide should provide competitive content depth");
assert.match(guideText, /常见图片尺寸参考/, "guide should include practical size references");
assert.match(guideText, /操作示例|调整示例/, "guide should include a concrete workflow example");
assert.match(guideText, /失败排查/, "guide should cover troubleshooting intent");
assert.match(guideText, /隐私|本地处理/, "guide should explain local processing and privacy");

for (const href of [
  "/tools/media/image-crop",
  "/tools/media/image-compressor",
  "/tools/media/image-format-converter",
  "/tools/media/image-blur",
]) {
  assert.match(html, new RegExp(`href="${href}"`, "i"), `${href} should be linked internally`);
}

console.log("PASS image-resize SEO checks");
