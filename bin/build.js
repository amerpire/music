const { join } = require("path");
const fse = require("fs-extra");
const { exec } = require("child_process");
const htmlmin = require("htmlmin");
const fs = require("fs");

const root = process.cwd();
const dist = 'www';
const src = join(root, "home-src");
const assets = join(root, join("src", "assets", "home"));

const deleteDist = () => {
  console.log("> deleteDist");
  if (fse.pathExistsSync(dist)) {
    fse.removeSync(dist);
  }

  if (fse.pathExistsSync(src)) {
    fse.removeSync(src);
  }
};

const copyAssets = () => {
  console.log("> copyAssets");
  fse.copySync(assets, dist);
};

const compileMD = (callback) => {
  console.log("> compileMD");
  exec("index-md", (error, stdout, stderr) => {
    if (error || stderr) {
      console.log("Failed to execute index-md");
    }
    if (error) {
      console.log(error.message);
      return;
    }
    if (stderr) {
      console.log(stderr);
      return;
    }
    console.log(stdout);
    callback?.();
  });
};

const minifyHTML = () => {
  console.log("> minifyHTML");
  const html = join(dist, "index.html");
  fs.writeFileSync(html, htmlmin(fs.readFileSync(join(dist, "index.html"), { encoding: "utf-8" })));
};

const copyMD = () => {
  fse.copySync('README.md', join(src, 'index.md'));
};


deleteDist();
copyAssets();
copyMD();
compileMD(minifyHTML);
