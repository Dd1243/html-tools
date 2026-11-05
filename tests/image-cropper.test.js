import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";

const html = fs.readFileSync(
  new URL("../tools/media/image-cropper.html", import.meta.url),
  "utf8",
);
const scripts = [
  ...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),
].map((m) => m[1]);
const source = scripts.find((s) => s.includes("const CROP_LIMITS"));
function core() {
  assert.ok(source, "The page must contain its standalone image crop core");
  const context = vm.createContext({});
  vm.runInContext(source.split("// Bind crop interface")[0], context);
  return (expression) =>
    JSON.parse(vm.runInContext("JSON.stringify(" + expression + ")", context));
}

test("image upload limits reject invalid, empty, oversized and excessive pixel inputs", () => {
  const run = core();
  assert.throws(
    () => run('validateUploadFile({type:"text/html",size:100})'),
    /格式/,
  );
  assert.throws(
    () => run('validateUploadFile({type:"image/png",size:0})'),
    /空/,
  );
  assert.throws(
    () => run('validateUploadFile({type:"image/png",size:26214401})'),
    /25/,
  );
  assert.doesNotThrow(() =>
    run('validateUploadFile({type:"image/png",size:100})'),
  );
  assert.throws(() => run("validateImageDimensions(12000,12000)"), /像素/);
  assert.throws(() => run("validateImageDimensions(0,100)"), /尺寸/);
});

test("oriented image size swaps at quarter turns and preserves dimensions after a full turn", () => {
  const run = core();
  assert.deepEqual(run("orientedSize(800,600,1)"), { w: 600, h: 800 });
  assert.deepEqual(run("orientedSize(800,600,4)"), { w: 800, h: 600 });
});

test("fit and move retain original pixel coordinates and stay inside image bounds", () => {
  const run = core();
  assert.deepEqual(run("fitCrop({w:800,h:600},1)"), {
    x: 100,
    y: 0,
    w: 600,
    h: 600,
  });
  assert.deepEqual(
    run("moveCrop({x:100,y:50,w:300,h:200},1000,-1000,{w:800,h:600})"),
    { x: 500, y: 0, w: 300, h: 200 },
  );
});

test("all four crop handles keep their opposite corner anchored and clamp bounds", () => {
  const run = core();
  const expected = {
    nw: { x: 0, y: 0, w: 400, h: 250 },
    ne: { x: 100, y: 0, w: 700, h: 250 },
    sw: { x: 0, y: 50, w: 400, h: 550 },
    se: { x: 100, y: 50, w: 700, h: 550 },
  };
  for (const [handle, value] of Object.entries(expected)) {
    const dx = handle.endsWith("w") ? -1000 : 1000;
    const dy = handle.startsWith("n") ? -1000 : 1000;
    assert.deepEqual(
      run(
        `resizeCrop({x:100,y:50,w:300,h:200},"${handle}",${dx},${dy},{w:800,h:600},null)`,
      ),
      value,
    );
  }
});

test("ratio handles and numeric edits preserve ratio within integer pixel rounding", () => {
  const run = core();
  for (const handle of ["nw", "ne", "sw", "se"]) {
    const r = run(
      `resizeCrop({x:100,y:100,w:320,h:180},"${handle}",200,300,{w:800,h:600},16/9)`,
    );
    assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= 800 && r.y + r.h <= 600);
    assert.ok(Math.abs(r.w - (r.h * 16) / 9) <= 1.8);
  }
  assert.deepEqual(
    run('editCrop({x:100,y:50,w:300,h:200},"w",600,{w:800,h:600},1)'),
    { x: 100, y: 50, w: 550, h: 550 },
  );
  assert.throws(
    () => run('editCrop({x:0,y:0,w:20,h:20},"w",NaN,{w:800,h:600},null)'),
    /数字/,
  );
});

test("output dimensions reject zero, noninteger and unsafe canvas sizes", () => {
  const run = core();
  assert.deepEqual(run("outputDimensions(1200,800)"), { w: 1200, h: 800 });
  for (const [w, h] of [
    [0, 100],
    [12.5, 100],
    [8193, 1],
    [5000, 5000],
  ])
    assert.throws(() => run(`outputDimensions(${w},${h})`), /尺寸|像素/);
});

test("an older sample render cannot replace a newer chosen file and encoding failures recover", async () => {
  const sampleSource =
    "async function useSample()" +
    source
      .split("async function useSample()")[1]
      .split("function pointerDown")[0];
  const drawing = new Proxy({}, { get: () => () => {} });
  const context = vm.createContext({
    state: { loading: false, fileName: "old.png" },
    loadSequence: 0,
    clearInteraction() {},
    setBusyControls() {},
    File: class {
      constructor(parts, name) {
        this.name = name;
      }
    },
    drawing,
  });
  vm.runInContext(
    `
    let callback, message='';
    const canvas={getContext:()=>drawing,toBlob:cb=>{callback=cb}};
    const document={createElement:()=>canvas};
    function feedback(text){message=text}
    async function loadImageFile(file){loadSequence++;state.fileName=file.name;state.loading=false}
    ${sampleSource}
  `,
    context,
  );
  const pending = vm.runInContext("useSample()", context);
  vm.runInContext(
    "loadSequence++;state.fileName='new.png';state.loading=false;callback({})",
    context,
  );
  await pending;
  assert.equal(context.state.fileName, "new.png");
  const failed = vm.runInContext("useSample()", context);
  vm.runInContext("callback(null)", context);
  await failed;
  assert.equal(context.state.loading, false);
  assert.match(vm.runInContext("message", context), /示例|失败/);
  vm.runInContext("canvas.toBlob=()=>{throw new Error('编码失败')}", context);
  await vm.runInContext("useSample()", context);
  assert.equal(context.state.loading, false);
  assert.match(vm.runInContext("message", context), /失败/);
});

test("metadata agrees with actual formats, privacy and page identity", () => {
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  assert.ok(desc && desc.length >= 120 && desc.length <= 160);
  assert.match(desc, /PNG/);
  assert.match(desc, /JPEG/);
  assert.match(desc, /WebP/);
  assert.equal(
    html.match(/<meta property="og:description" content="([^"]*)"/)[1],
    desc,
  );
  assert.equal(
    html.match(/<meta name="twitter:description" content="([^"]*)"/)[1],
    desc,
  );
  const app = scripts
    .filter((s) => s.trim().startsWith("{"))
    .map((s) => JSON.parse(s))
    .find((s) => s["@type"] === "WebApplication");
  assert.equal(app.description, desc);
  assert.equal(app.dateModified, "2026-11-05");
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  assert.equal(
    html.match(/<meta property="og:title" content="([^"]+)"/)[1],
    title,
  );
  assert.equal(
    html.match(/<meta name="twitter:title" content="([^"]+)"/)[1],
    title,
  );
  const url = "https://essays4u.net/tools/media/image-cropper";
  assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)[1], url);
  assert.equal(html.match(/<meta property="og:url" content="([^"]+)"/)[1], url);
  assert.equal(app.url, url);
  for (const link of [
    "image-resize",
    "image-compressor",
    "image-format-converter",
    "image-flip",
  ])
    assert.ok(html.includes(`href="/tools/media/${link}"`));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)/);
  for (const s of scripts.filter((s) => !s.trim().startsWith("{")))
    assert.doesNotThrow(() => new vm.Script(s));
});
