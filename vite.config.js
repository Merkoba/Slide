const path = require(`node:path`)
const {defineConfig} = require(`vite`)
const fg = require(`fast-glob`)

module.exports = defineConfig(async () => {
  const {default: bundleAudioWorkletPlugin} = await import(`./strudel/packages/vite-plugin-bundle-audioworklet/vite-plugin-bundle-audioworklet.js`)

  let project_root = __dirname
  let strudel_root = path.resolve(project_root, `strudel/packages`)

  let alias_values = {
    '@strudel.cycles': strudel_root,
    '@strudel': strudel_root,
    superdough: path.resolve(strudel_root, `superdough`),
    supradough: path.resolve(strudel_root, `supradough`),
  }

  // Custom plugin to enforce import order in entry.js
  let ordered_imports_plugin = () => {
    return {
      name: `ordered-imports`,
      enforce: `pre`,
      transform(code, id) {
        let entry_file = path.resolve(project_root, `entry.js`)

        // Only run this on the entry file
        if (id === entry_file) {
          // 1. Find files using fast-glob
          // We use explicit lists to control the order exactly
          let lib_files = fg.sync(`./src/libs/*.js`)

          // Exclude app.js just in case it ends up in main, though typically it is separate
          let main_files = fg.sync([`./src/main/*.js`, `!./src/main/app.js`])

          let lines = []

          // Step 1: Manual App Import
          lines.push(`import "./src/app.js"`)

          // Step 2: Libs
          lib_files.forEach((file) => {
            // Ensure path has ./ prefix for local import
            lines.push(`import "./${file}"`)
          })

          // Step 3: Main Plugins
          main_files.forEach((file) => {
            lines.push(`import "./${file}"`)
          })

          return {
            code: lines.join(`\n`),
            map: null,
          }
        }
      },
    }
  }

  return {
    resolve: {
      alias: alias_values,
    },
    plugins: [
      ordered_imports_plugin(),
      bundleAudioWorkletPlugin(),
    ],
    build: {
      lib: {
        entry: path.resolve(project_root, `entry.js`),
        name: `SlideBundle`,
        formats: [`iife`],
        fileName: () => `strudel.bundle.js`,
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
      cssCodeSplit: false,
      target: `esnext`,
      emptyOutDir: true,
      assetsDir: `.`,
    },
  }
})