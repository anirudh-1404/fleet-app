const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const screensDir = path.join(rootDir, "MobileApp", "src", "screens");

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".jsx") || file.endsWith(".js")) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const allScreenFiles = getAllFiles(screensDir);
console.log(`Found ${allScreenFiles.length} screen files.`);

let updatedCount = 0;

allScreenFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Check if SafeAreaView is imported from "react-native"
  const rnImportRegex = /import\s*\{([^}]+)\}\s*from\s*["']react-native["'];?/;
  const rnMatch = content.match(rnImportRegex);

  if (rnMatch && rnMatch[1].includes("SafeAreaView")) {
    let namedImports = rnMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && s !== "SafeAreaView");

    let newRnImport = "";
    if (namedImports.length > 0) {
      newRnImport = `import {\n  ${namedImports.join(",\n  ")},\n} from "react-native";`;
    }

    content = content.replace(rnMatch[0], newRnImport);
    modified = true;

    // Check if SafeAreaView is already imported from react-native-safe-area-context
    if (!content.includes('from "react-native-safe-area-context"')) {
      content = `import { SafeAreaView } from "react-native-safe-area-context";\n` + content;
    } else if (!content.match(/import\s*\{[^}]*SafeAreaView[^}]*\}\s*from\s*["']react-native-safe-area-context["']/)) {
      content = content.replace(
        /import\s*\{([^}]+)\}\s*from\s*["']react-native-safe-area-context["'];?/,
        (m, p1) => `import { ${p1.trim()}, SafeAreaView } from "react-native-safe-area-context";`
      );
    }
  }

  // Ensure <SafeAreaView has edges={["top"]} if not present
  if (content.includes("<SafeAreaView") && !content.includes("edges=")) {
    content = content.replace(
      /<SafeAreaView(\s+style=\{[^}]+\})/g,
      `<SafeAreaView$1 edges={["top"]}`
    );
    content = content.replace(
      /<SafeAreaView(\s+className="[^"]+")/g,
      `<SafeAreaView$1 edges={["top"]}`
    );
    content = content.replace(
      /<SafeAreaView(\s*>)/g,
      `<SafeAreaView edges={["top"]}$1`
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    updatedCount++;
    console.log(`Updated: ${path.relative(rootDir, filePath)}`);
  }
});

console.log(`\nSuccessfully updated ${updatedCount} screen files with safe area context.`);
