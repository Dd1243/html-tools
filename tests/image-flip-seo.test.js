import assert from "node:assert/strict";
import fs from "node:fs";

const file = "tools/media/image-flip.html";
const html = fs.readFileSync(file, "utf8");
const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || "";
const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || "";
const article = html.match(/<article class="seo-content">([\s\S]*?)<\/article>/i)?.[1] || "";
const articleText = article.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const schemaDescriptions = [...html.matchAll(/"description":\s*"([^"]*)"/g)].map((match) => match[1]);
const chineseCharacters = [...articleText].filter((char) => /[\u3400-\u9fff]/.test(char)).length;

assert.ok(title.length >= 28 && title.length <= 60, "title should be concise and descriptive");
assert.match(title, /图片翻转|图片镜像/, "title should target image flip intent");
assert.ok(description.length >= 110 && description.length <= 160, "description should fit Chinese search snippet length");
assert.match(description, /图片翻转|水平翻转|垂直翻转/, "description should target image flip intent");
assert.doesNotMatch(description, /音视频媒体工具|实时代码高亮|一键复制结果|实用小工具合集/, "description should be page-specific");
assert.equal((html.match(/<h1\b/gi) || []).length, 1, "page should have one h1");
assert.match(html, /"@type":\s*"WebApplication"/, "page should have WebApplication schema");
assert.ok(schemaDescriptions.every((value) => !/适用于 media|实时计算|结果复制|关键词/.test(value)), "schema descriptions should be specific");
assert.ok(chineseCharacters >= 1500, "guide should provide competitive content depth");
assert.match(articleText, /水平翻转和垂直翻转的区别/, "guide should explain flip directions");
assert.match(articleText, /图片翻转、旋转和裁剪的区别/, "guide should address related search intent");
assert.match(articleText, /隐私|本地处理/, "guide should explain local processing");

for (const href of [
  "/tools/media/image-crop",
  "/tools/media/image-resize",
  "/tools/media/image-compressor",
  "/tools/media/image-format-converter",
]) {
  assert.match(html, new RegExp(`href="${href}"`, "i"), `${href} should be linked internally`);
}

console.log("PASS image-flip SEO checks");
