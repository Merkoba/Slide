import {EditorView} from "codemirror"
import {Decoration} from "@codemirror/view"
import {StateField, StateEffect} from "@codemirror/state"

App.mirror_enabled = true

App.setup_drawer = () => {
  let max_haps = 1000
  let pending_locations = null
  let render_frame = null

  let flush_highlights = () => {
    render_frame = null

    if (!App.editor || !pending_locations) {
      return
    }

    App.editor.dispatch({
      effects: App.set_highlight.of(pending_locations),
    })

    pending_locations = null
  }

  // New helper: kills any queued update so it doesn't overwrite a clean
  App.cancel_mirror_render = () => {
    if (render_frame) {
      window.cancelAnimationFrame(render_frame)
      render_frame = null
    }

    pending_locations = null
  }

  App.drawer = new Drawer((active_haps) => {
    if (!App.mirror_enabled || (active_haps.length > max_haps)) {
      return
    }

    let locations = []

    for (let hap of active_haps) {
      if (hap.context && hap.context.locations) {
        locations.push(...hap.context.locations)
      }
      else if (hap.context && hap.context.location) {
        locations.push(hap.context.location)
      }
    }

    pending_locations = locations

    if (!render_frame) {
      render_frame = window.requestAnimationFrame(flush_highlights)
    }
  }, [0, 0])
}

App.setup_strudel_mirror = () => {
  App.set_highlight = StateEffect.define()

  App.highlight_extension = StateField.define({
    create() {
      return Decoration.none
    },
    update(decorations, transaction) {
      decorations = decorations.map(transaction.changes)

      for (let effect of transaction.effects) {
        if (effect.is(App.set_highlight)) {
          let doc_length = transaction.newDoc.length

          if (doc_length === 0) {
            return Decoration.none
          }

          let new_marks = effect.value
            .filter(loc => {
              // Ensure the highlight range fits within the current document
              return loc.end <= doc_length
            })
            .map(loc => {
              return Decoration.mark({class: `sh-executing`}).range(loc.start, loc.end)
            })

          return Decoration.set(new_marks, true)
        }
      }

      return decorations
    },

    provide: field => EditorView.decorations.from(field)
  })
}

App.clean_mirror = () => {
  // 1. Cancel the pending frame before cleaning!
  if (App.cancel_mirror_render) {
    App.cancel_mirror_render()
  }

  // 2. Now it is safe to clear
  if (App.editor) {
    App.editor.dispatch({
      effects: App.set_highlight.of([]),
    })
  }
}

App.toggle_mirror = () => {
  App.mirror_enabled = !App.mirror_enabled

  if (App.mirror_enabled) {
    if (App.is_playing()) {
      App.start_drawer()
    }
  }
  else {
    App.stop_drawer()
    App.clean_mirror()
  }

  App.stor_save_mirror()
}

App.start_drawer = () => {
  if (!App.draw_started) {
    App.drawer.start(App.scheduler)
    App.draw_started = true
  }
}

App.stop_drawer = () => {
  App.drawer.stop()
  App.draw_started = false
}