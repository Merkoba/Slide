App.controls_enabled = true

App.setup_controls = () => {
  App.check_controls()
}

App.toggle_controls = () => {
  App.controls_enabled = !App.controls_enabled
  App.check_controls()
  App.stor_save_controls()
}

App.check_controls = () => {
  let c = DOM.el(`#top-controls`)

  if (App.controls_enabled) {
    DOM.show(c)
  }
  else {
    DOM.hide(c)
  }
}