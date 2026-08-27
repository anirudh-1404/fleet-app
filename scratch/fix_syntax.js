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

allScreenFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf8");

  // Fix any >> in SafeAreaView
  content = content.replace(/<SafeAreaView([^>]+)>>/g, '<SafeAreaView$1>');
  // Normalize edges duplicate
  content = content.replace(/edges=\{\["top"\]\}\s*edges=\{\["top"\]\}/g, 'edges={["top"]}');

  fs.writeFileSync(filePath, content, "utf8");
});

console.log("Cleaned up double brackets and tags.");
