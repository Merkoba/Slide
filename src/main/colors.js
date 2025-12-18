App.colors_enabled = true
App.border_color = `#444`

App.apply_color = (color) => {
  App.scope_color = color

  let volume_value = DOM.el(`#volume-value`)
  let volume_slider = DOM.el(`#volume-slider`)
  let tempo_value = DOM.el(`#tempo-value`)
  let tempo_slider = DOM.el(`#tempo-slider`)
  let status_el = DOM.el(`#status`)
  let image_el = DOM.el(`#image`)

  if (volume_value) {
    volume_value.style.color = color
  }

  if (volume_slider) {
    volume_slider.style.accentColor = color
  }

  if (tempo_value) {
    tempo_value.style.color = color
  }

  if (tempo_slider) {
    tempo_slider.style.accentColor = color
  }

  if (status_el) {
    status_el.style.color = color
  }

  if (image_el) {
    image_el.style.filter = `drop-shadow(0 0 0.15rem ${color})`
  }
}

App.color_interface = (level) => {
  let color = App[`scope_click_color_${level}`]
  App.do_color_interface(color)
}

App.restore_interface_colors = () => {
  App.do_color_interface(App.border_color)
}

App.do_color_interface = (color) => {
  App.set_css_var(`border-color`, color)
}