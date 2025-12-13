import "./src/app.js"

// 2. Load Libs next (Glob)
// We capture them to prevent tree-shaking
const libs = import.meta.glob("./src/libs/*.js", {eager: true})

// 3. Load remaining source files (Glob)
// Exclude app.js (loaded in step 1) and libs (loaded in step 2)
const plugins = import.meta.glob(["./src/main/*.js", "!./app.js"], {eager: true})

// Helper to execute side effects (prevent tree-shaking)
function load(modules) {
  for (let path in modules) {
    modules[path]
  }
}

load(libs)
load(plugins)