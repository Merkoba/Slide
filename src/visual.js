App.visual_mode = `auto`

App.create_visual_modal = () => {
  let modal = App.create_list_modal(`visual`)
  let title = DOM.el(`.modal-title`, modal)
  title.textContent = `Select Visual`
}

App.open_visual_modal = async () => {
  let items = [
    `Auto`,
    `None`,
    `Hydra`,
    `Scope`,
    `Piano`,
  ]

  App.show_items_modal(`visual`, {
    items,
    action: (item) => {
      let mode = item.toLowerCase()
      App.apply_visual(mode)
      App.close_modal(`visual`)
    },
  })
}

App.apply_visual = (mode) => {
  App.visual_mode = mode

  // Always clean up previous visuals first to prevent stacking
  App.clean_canvas()

  if (mode === `hydra`) {
    // Checks if the global function exists before calling
    if (typeof initHydra === `function`) {
      initHydra()
    }
  }
  else if (mode === `scope`) {
    if (typeof initScope === `function`) {
      initScope()
    }
  }
  else if (mode === `piano`) {
    // Strudel function is typically initPiano(), not initPianoroll
    if (typeof initPiano === `function`) {
      initPiano()
    }
  }
  else if (mode === `auto`) {
    // Auto behavior depends on your app logic.
    // Usually 'Auto' means we default to Scope or let the code currently running decide.
    // If you want a safe default:
    if (typeof initScope === `function`) {
      initScope()
    }
  }
}