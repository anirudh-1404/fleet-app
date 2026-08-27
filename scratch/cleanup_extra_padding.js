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
let cleaned = 0;

allScreenFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf8");

  // Remove `, paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0`
  const pattern = /,\s*paddingTop:\s*Platform\.OS\s*===\s*["']android["']\s*\?\s*\(StatusBar\.currentHeight\s*\|\|\s*\d+\)\s*:\s*0/g;
  if (pattern.test(content)) {
    content = content.replace(pattern, "");
    fs.writeFileSync(filePath, content, "utf8");
    cleaned++;
  }
});

console.log(`Cleaned extra paddingTop from ${cleaned} screens.`);
