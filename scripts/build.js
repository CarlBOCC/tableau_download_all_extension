// scripts/build.js
// Minimal "build" that copies static assets to ./build for Azure SWA

const fs = require("fs");
const path = require("path");

const SRC_PUBLIC = path.join(__dirname, "..", "public");
const FILES_AT_ROOT = ["manifest.trex", "staticwebapp.config.json"]; // add more if needed
const OUT_DIR = path.join(__dirname, "..", "build");

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, path.basename(src));
  fs.copyFileSync(src, dest);
}

(function main() {
  // clean build
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // copy /public -> /build
  if (fs.existsSync(SRC_PUBLIC)) copyDir(SRC_PUBLIC, OUT_DIR);

  // copy root files (manifest, config, etc.)
  for (const f of FILES_AT_ROOT) {
    const full = path.join(__dirname, "..", f);
    if (fs.existsSync(full)) copyFile(full, OUT_DIR);
  }

  console.log("Build complete → ./build");
})();
