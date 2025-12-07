App.create_settings_modal = () => {
  let modal = App.create_modal(`settings`)
  let title = DOM.el(`.modal-title`, modal)
  title.textContent = `Settings`
  let body = DOM.el(`.modal-body`, modal)

  let scope = DOM.create(`button`)
  scope.textContent = `Toggle Scope`
  scope.title = `Show or hide the scope visualizer`

  DOM.ev(scope, `click`, () => {
    App.toggle_scope()
    App.close_modal(`settings`)
  })

  let visual = DOM.create(`button`)
  visual.textContent = `Select Visual`
  visual.title = `Change the background animation`

  DOM.ev(visual, `click`, () => {
    App.open_visual_modal()
    App.close_modal(`settings`)
  })

  body.appendChild(visual)
  body.appendChild(scope)
}

App.open_settings_modal = () => {
  App.open_modal(`settings`)
}