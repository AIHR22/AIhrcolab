const fs = require("fs")
const path = require("path")

// Function to recursively find all .tsx files
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      findTsxFiles(filePath, fileList)
    } else if (file.endsWith(".tsx")) {
      fileList.push(filePath)
    }
  })

  return fileList
}

// Function to extract imports from a file
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const importRegex = /import\s+(?:{[^}]*}|\w+)\s+from\s+['"]([^'"]+)['"]/g
  const imports = []
  let match

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1])
  }

  return imports
}

// Function to check if an import exists
function checkImportExists(importPath) {
  // Handle absolute imports
  if (importPath.startsWith("@/")) {
    importPath = importPath.replace("@/", "./")
  }

  // Handle relative imports
  if (!importPath.startsWith(".") && !importPath.startsWith("/")) {
    // This is a package import, assume it exists
    return true
  }

  // Handle file extensions
  if (!importPath.endsWith(".ts") && !importPath.endsWith(".tsx") && !importPath.endsWith(".js")) {
    // Try with different extensions
    return (
      fs.existsSync(`${importPath}.ts`) ||
      fs.existsSync(`${importPath}.tsx`) ||
      fs.existsSync(`${importPath}.js`) ||
      fs.existsSync(importPath)
    )
  }

  return fs.existsSync(importPath)
}

// Main function
function checkMissingImports() {
  const tsxFiles = findTsxFiles("./app")
  const missingImports = []

  tsxFiles.forEach((file) => {
    const imports = extractImports(file)

    imports.forEach((importPath) => {
      if (!checkImportExists(importPath)) {
        missingImports.push({
          file,
          importPath,
        })
      }
    })
  })

  if (missingImports.length > 0) {
    console.log("Missing imports found:")
    missingImports.forEach(({ file, importPath }) => {
      console.log(`${file}: ${importPath}`)
    })
  } else {
    console.log("No missing imports found!")
  }
}

checkMissingImports()

