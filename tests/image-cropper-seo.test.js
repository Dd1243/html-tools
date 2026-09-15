import assert from "node:assert/strict";
import fs from "node:fs";

const file = "tools/media/image-cropper.html";
const html = fs.readFileSync(file, "utf8");
const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || "";
const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || "";
const article = html.match(/<article class="seo-content">([\s\S]*?)<\/article>/i)?.[1] || "";
const articleText = article.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const schemaDescriptions = [...html.matchAll(/"description":\s*"([^"]*)"/g)].map((match) => match[1]);
const chineseCharacters = [...articleText].filter((char) => /[\u3400-\u9fff]/.test(char)).length;

assert.ok(title.length >= 28 && title.length <= 60, "title should be concise and descriptive");
assert.match(title, /图片裁剪|在线裁剪/, "title should target image crop intent");
assert.ok(description.length >= 110 && description.length <= 160, "description should fit Chinese search snippet length");
assert.match(description, /图片裁剪|裁剪图片|自由裁剪/, "description should target image crop intent");
assert.doesNotMatch(description, /音视频媒体工具|DevOps|代码审查|Python 脚本|一键复制/, "description should be page-specific");
assert.equal((html.match(/<h1\b/gi) || []).length, 1, "page should have one h1");
assert.match(html, /"@type":\s*"WebApplication"/, "page should include WebApplication schema");
assert.ok(schemaDescriptions.every((value) => !/适用于 media|结构化结果|关键词|复杂任务/.test(value)), "schema descriptions should be specific");
assert.ok(chineseCharacters >= 1500, "guide should provide competitive content depth");
assert.match(articleText, /常用图片裁剪比例/, "guide should include practical crop ratios");
assert.match(articleText, /图片裁剪、缩放和压缩的区别/, "guide should address adjacent search intent");
assert.match(articleText, /隐私|本地处理/, "guide should explain local processing");

for (const href of [
  "/tools/media/image-resize",
  "/tools/media/image-compressor",
  "/tools/media/image-format-converter",
  "/tools/media/image-flip",
]) {
  assert.match(html, new RegExp(`href="${href}"`, "i"), `${href} should be linked internally`);
}

console.log("PASS image-cropper SEO checks");
