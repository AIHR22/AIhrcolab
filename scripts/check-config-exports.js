const fs = require("fs")
const path = require("path")
const { parse } = require("@babel/parser")
const traverse = require("@babel/traverse").default

// Valid Next.js config exports
const validConfigExports = [
  "generateStaticParams",
  "generateMetadata",
  "metadata",
  "viewport",
  "dynamic",
  "dynamicParams",
  "revalidate",
  "fetchCache",
  "runtime",
  "preferredRegion",
  "maxDuration",
  "default", // For the default export
]

// Function to check if a file has invalid config exports
function checkFileForInvalidExports(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")

    // Parse the file content
    const ast = parse(content, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    })

    const invalidExports = []

    // Traverse the AST to find export declarations
    traverse(ast, {
      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration

        // Check variable declarations
        if (declaration && declaration.type === "VariableDeclaration") {
          declaration.declarations.forEach((declarator) => {
            const name = declarator.id.name
            if (name === "config" || name === "Config") {
              invalidExports.push(name)
            }
          })
        }

        // Check function declarations
        if (declaration && declaration.type === "FunctionDeclaration") {
          const name = declaration.id.name
          if (name === "config" || name === "Config") {
            invalidExports.push(name)
          }
        }

        // Check export specifiers
        if (path.node.specifiers) {
          path.node.specifiers.forEach((specifier) => {
            if (specifier.exported) {
              const name = specifier.exported.name
              if (name === "config" || name === "Config") {
                invalidExports.push(name)
              }
            }
          })
        }
      },
    })

    return invalidExports
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error)
    return []
  }
}

// Function to recursively scan a directory for page files
function scanDirectory(dir) {
  const results = []

  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (file !== "node_modules" && file !== ".next") {
        results.push(...scanDirectory(filePath))
      }
    } else if (
      (file === "page.tsx" || file === "page.jsx" || file === "layout.tsx" || file === "layout.jsx") &&
      (dir.includes("/app/") || dir.startsWith("app/"))
    ) {
      const invalidExports = checkFileForInvalidExports(filePath)

      if (invalidExports.length > 0) {
        results.push({
          filePath,
          invalidExports,
        })
      }
    }
  }

  return results
}

// Main function
function main() {
  console.log("Checking for invalid config exports in Next.js pages...")

  const appDir = path.join(process.cwd(), "app")

  if (!fs.existsSync(appDir)) {
    console.error("App directory not found. Make sure you are running this script from the project root.")
    process.exit(1)
  }

  const results = scanDirectory(appDir)

  if (results.length === 0) {
    console.log("No invalid config exports found. All good!")
  } else {
    console.log(`Found ${results.length} files with invalid config exports:`)

    results.forEach((result) => {
      console.log(`\n${result.filePath}:`)
      console.log(`  Invalid exports: ${result.invalidExports.join(", ")}`)
      console.log("  Fix: Rename these exports or remove them. Use valid Next.js exports instead.")
    })

    console.log("\nValid Next.js exports include:")
    console.log(validConfigExports.join(", "))
  }
}

main()

