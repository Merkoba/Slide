App.start_keyboard = () => {
  DOM.ev(document, `keydown`, (e) => {
    if (e.key === `s`) {
      if (e.ctrlKey) {
        e.preventDefault()
        App.play_action()
      }
    }
    else if (e.key === `Escape`) {
      e.preventDefault()

      if (NeedContext.open) {
        return
      }

      if (App.modal_open()) {
        App.close_current_modal()
      }
      else {
        App.stop_action()
      }
    }
    else if (e.key === `1`) {
      if (e.ctrlKey) {
        App.show_sounds_context()
      }
    }
    else if (e.key === `2`) {
      if (e.ctrlKey) {
        App.show_notes_context()
      }
    }
    else if (e.key === `3`) {
      if (e.ctrlKey) {
        App.show_banks_context()
      }
    }
  })
}

App.bank_hint_func = (cm) => {
  let cursor = cm.getCursor()

  return {
    list: App.strudel_banks,
    from: cursor,
    to: cursor
  }
}

App.sound_hint_func = (cm) => {
  let cursor = cm.getCursor()

  return {
    list: App.strudel_sounds,
    from: cursor,
    to: cursor
  }
}

App.setup_editor_autocomplete = () => {
  // Add this inside App.create_editor()
  App.editor.on(`inputRead`, (cm, change) => {
    // change.text is an array of the strings that were inserted
    let typed_char = change.text[0]

    // Only trigger if the user just typed a quote
    if (typed_char === `"` || typed_char === `'`) {
      let cursor = cm.getCursor()
      let line = cm.getLine(cursor.line)
      let text_before = line.slice(0, cursor.ch)

      // Check for bank("
      if (text_before.endsWith(`bank("`) || text_before.endsWith(`bank('`)) {
        // completeSingle: false prevents it from auto-picking if there's only 1 option
        cm.showHint({hint: App.bank_hint_func, completeSingle: false})
      }
      // Check for sound("
      else if (text_before.endsWith(`sound("`) || text_before.endsWith(`sound('`)) {
        cm.showHint({hint: App.sound_hint_func, completeSingle: false})
      }
    }
  })
}