import fs from "node:fs";
import path from "node:path";

// comando: npm run tree
// package.json: "tree": "node scripts/tree-front.js"

const DEFAULT_EXCLUDES = new Set([
  "node_modules",
  ".env.dist",
  "eslint.config.js",
  "GUIA-RAPIDA-TOKEN-REFRESH.md",
  "package-lock.json",
  "README-TOKEN-REFRESH.md",
  "tsconfig.app.json",
  "tsconfig.json",
  "tsconfig.node.json",
  "vite.config.ts",
  ".git",
]);

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    root: process.cwd(),
    excludes: new Set(DEFAULT_EXCLUDES),
    includeIcons: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--exclude=")) {
      const parts = arg.replace(/^--exclude=/, "").split(",").map((item) => item.trim()).filter(Boolean);
      for (const part of parts) options.excludes.add(part);
    } else if (arg === "--exclude-icons") {
      options.excludes.add(path.join("public", "icons"));
    } else if (arg.startsWith("--root=")) {
      options.root = path.resolve(process.cwd(), arg.replace(/^--root=/, ""));
    }
  }

  return options;
};

const isExcluded = (name, relativePath, excludes) => {
  if (excludes.has(name)) return true;
  if (excludes.has(relativePath)) return true;
  return false;
};

const readTree = (dir, prefix, isLast, options, parentRelative = "") => {
  const items = fs.readdirSync(dir, { withFileTypes: true })
    .filter((dirent) => !isExcluded(dirent.name, path.join(parentRelative, dirent.name), options.excludes))
    .sort((a, b) => {
      if (a.isDirectory() === b.isDirectory()) {
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      return a.isDirectory() ? -1 : 1;
    });

  items.forEach((dirent, index) => {
    const isLastItem = index === items.length - 1;
    const connector = isLastItem ? "└── " : "├── ";
    const relativePath = path.join(parentRelative, dirent.name);
    if (dirent.isDirectory()) {
      const nextPrefix = prefix + (isLastItem ? "    " : "│   ");
      readTree(path.join(dir, dirent.name), nextPrefix, isLastItem, options, relativePath);
    }
  });
};

const main = () => {
  const options = parseArgs();
  const rootName = path.basename(options.root);
  readTree(options.root, "", true, options, "");
};

main();
