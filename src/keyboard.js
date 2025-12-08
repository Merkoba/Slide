App.keyboard_popup_delay = 5 * 1000
App.max_keboard_buffer = 25
App.context_mode = `sound`

App.start_keyboard = () => {
  let input_buffer = []

  DOM.ev(document, `keydown`, (e) => {
    let now = Date.now()

    if ((e.key.length === 1)) {
      input_buffer.push({char: e.key, time: now})

      if (input_buffer.length > App.max_keboard_buffer) {
        input_buffer.shift()
      }
    }

    input_buffer = input_buffer.filter((item) => {
      return ((now - item.time) < App.keyboard_popup_delay)
    })

    let recent_text = input_buffer.map((item) => item.char).join(``)

    if (recent_text.endsWith(`sound("`)) {
      setTimeout(() => {
        App.show_sound_context()
      }, 10)

      input_buffer = []
      App.context_mode = `sound`
    }
    else if (recent_text.endsWith(`bank("`)) {
      setTimeout(() => {
        App.show_bank_context()
      }, 10)

      input_buffer = []
      App.context_mode = `bank`
    }
  })

  DOM.ev(document, `keyup`, (e) => {
    if (e.key === `s`) {
      if (e.ctrlKey) {
        e.preventDefault()
        App.play_action()
      }
    }
    else if (e.key === `Escape`) {
      e.preventDefault()

      if (App.modal_open()) {
        App.close_current_modal()
      }
      else {
        App.stop_action()
      }

    }
    else if (e.key === `Enter`) {
      if (e.ctrlKey) {
        e.preventDefault()

        if (App.context_mode === `sound`) {
          App.show_sound_context()
        }
        else if (App.context_mode === `bank`) {
          App.show_bank_context()
        }
      }
    }
  })
}