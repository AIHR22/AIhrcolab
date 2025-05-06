const fs = require("fs")
const path = require("path")

// Get the dashboard directory
const dashboardDir = path.join(process.cwd(), "app", "dashboard")

// Function to add dynamic export to a file
function addDynamicExport(filePath) {
  if (!fs.existsSync(filePath)) return

  const content = fs.readFileSync(filePath, "utf8")

  // Check if the file already has the dynamic export
  if (content.includes("export const dynamic")) {
    console.log(`File ${filePath} already has dynamic export`)
    return
  }

  // Add the dynamic export at the top of the file
  const newContent = `import { dashboardConfig } from "../config";\n\n// Apply dynamic config to disable static generation\nexport const dynamic = dashboardConfig.dynamic;\n\n${content}`

  fs.writeFileSync(filePath, newContent)
  console.log(`Added dynamic export to ${filePath}`)
}

// Function to process a directory recursively
function processDirectory(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      processDirectory(filePath)
    } else if (file === "page.tsx" || file === "page.js") {
      addDynamicExport(filePath)
    }
  }
}

// Create the config file if it doesn't exist
const configPath = path.join(dashboardDir, "config.ts")
if (!fs.existsSync(configPath)) {
  const configContent = `// This file contains configuration for all dashboard pages
export const dashboardConfig = {
  // Set to force-dynamic to disable static generation for all dashboard pages
  // This ensures that client-side hooks like useAPI work correctly
  dynamic: "force-dynamic" as const
}`

  fs.writeFileSync(configPath, configContent)
  console.log(`Created config file at ${configPath}`)
}

// Process the dashboard directory
processDirectory(dashboardDir)

console.log("Done!")

