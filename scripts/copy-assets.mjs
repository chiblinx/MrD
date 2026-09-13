import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const assets = [
  {
    from: "src/catalog/catalog.json",
    to: "dist/catalog/catalog.json"
  }
];

await Promise.all(
  assets.map(async ({ from, to }) => {
    const target = resolve(to);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(resolve(from), target);
  })
);
