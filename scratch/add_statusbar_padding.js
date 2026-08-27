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
let updatedCount = 0;

allScreenFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Make sure Platform and StatusBar are imported from "react-native"
  const rnImportRegex = /import\s*\{([^}]+)\}\s*from\s*["']react-native["'];?/;
  const rnMatch = content.match(rnImportRegex);

  if (rnMatch) {
    let named = rnMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
    let added = false;
    if (!named.includes("Platform")) {
      named.push("Platform");
      added = true;
    }
    if (!named.includes("StatusBar")) {
      named.push("StatusBar");
      added = true;
    }
    if (added) {
      content = content.replace(
        rnMatch[0],
        `import {\n  ${named.join(",\n  ")},\n} from "react-native";`
      );
      modified = true;
    }
  }

  // Ensure SafeAreaView has style with paddingTop for Android
  // Pattern: style={{ flex: 1, backgroundColor: ... }}
  // We want: style={{ flex: 1, backgroundColor: ..., paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0 }}
  const safeAreaStyleRegex = /<SafeAreaView([^>]*style=\{\{\s*flex:\s*1,\s*backgroundColor:\s*["'][^"']+["']\s*\}\}[^>]*)>/g;

  if (safeAreaStyleRegex.test(content)) {
    content = content.replace(
      /<SafeAreaView([^>]*style=\{\{\s*flex:\s*1,\s*backgroundColor:\s*(["'][^"']+["'])\s*\}\}[^>]*)>/g,
      (match, p1, bg) => {
        if (!p1.includes("StatusBar.currentHeight") && !p1.includes("paddingTop")) {
          return `<SafeAreaView style={{ flex: 1, backgroundColor: ${bg}, paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0 }} edges={["top"]}>`;
        }
        return match;
      }
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    updatedCount++;
  }
});

console.log(`Updated ${updatedCount} files with explicit Android StatusBar top padding.`);
