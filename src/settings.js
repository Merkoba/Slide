App.create_settings_modal = () => {
  let modal = App.create_modal(`settings`)
  let title = DOM.el(`.modal-title`, modal)
  title.textContent = `Settings`
  let body = DOM.el(`.modal-body`, modal)

  let scope = DOM.create(`button`)
  scope.textContent = `Toggle Scope`

  DOM.ev(scope, `click`, () => {
    App.toggle_scope()
    App.close_modal(`settings`)
  })

  let visual = DOM.create(`button`)
  visual.textContent = `Select Visual`

  DOM.ev(visual, `click`, () => {
    App.open_visual_modal()
    App.close_modal(`settings`)
  })

  body.appendChild(scope)
  body.appendChild(visual)
}

App.open_settings_modal = () => {
  App.open_modal(`settings`)
}