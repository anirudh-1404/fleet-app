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
let errors = 0;

allScreenFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  // Check matching <SafeAreaView and </SafeAreaView>
  const openCount = (content.match(/<SafeAreaView/g) || []).length;
  const closeCount = (content.match(/<\/SafeAreaView>/g) || []).length;
  if (openCount !== closeCount) {
    console.error(`Mismatch in ${path.relative(rootDir, filePath)}: ${openCount} open vs ${closeCount} close`);
    errors++;
  }
});

if (errors === 0) {
  console.log(`All ${allScreenFiles.length} screen files have perfectly balanced SafeAreaView tags!`);
} else {
  console.error(`Found ${errors} files with tag mismatches.`);
}
