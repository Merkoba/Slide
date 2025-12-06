App.escape_regex = (s) => {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

App.underspace = (s) => {
  return s.replace(/_+/g, ` `).trim()
}

App.clean_canvas = () => {
  let body = document.body
  let canvases = DOM.els(`canvas`)

  for (let canvas of canvases) {
    if ([`scope-canvas`].includes(canvas.id)) {
      continue
    }

    body.removeChild(canvas)
  }
}