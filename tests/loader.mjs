import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import ts from "typescript";

const EXTENSIONS = [".ts", ".tsx", ".js", ".mjs", ".json"];

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") || specifier.startsWith("/")) {
    const parentURL = context.parentURL;
    let basePath;
    if (parentURL) {
      const parentPath = fileURLToPath(parentURL);
      basePath = join(dirname(parentPath), specifier);
    } else {
      basePath = specifier;
    }

    for (const ext of EXTENSIONS) {
      if (existsSync(basePath + ext)) {
        return nextResolve(pathToFileURL(basePath + ext).href, context);
      }
    }

    for (const ext of EXTENSIONS) {
      if (existsSync(join(basePath, "index" + ext))) {
        return nextResolve(pathToFileURL(join(basePath, "index" + ext)).href, context);
      }
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    const filePath = fileURLToPath(url);
    const sourceText = readFileSync(filePath, "utf-8");
    const transpiled = ts.transpileModule(sourceText, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: filePath,
    });

    return {
      format: "module",
      shortCircuit: true,
      source: transpiled.outputText,
    };
  }

  return nextLoad(url, context);
}
