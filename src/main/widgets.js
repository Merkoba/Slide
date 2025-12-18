App.setup_custom_numbers = () => {
  let wrappers = DOM.els(`.custom-number`)

  for (let wrapper of wrappers) {
    DOM.ev(wrapper, `click`, (e) => {
      // ignore clicks inside the actual text input box
      if (e.target.tagName === `INPUT`) {
        return
      }

      let input = DOM.el(`input`, wrapper)
      let rect = wrapper.getBoundingClientRect()

      // calculate click position relative to the wrapper
      let x = (e.clientX - rect.left)
      let width = rect.width
      let button_width = 30 // must match css width

      // logic: the 'down' button is the first 30px on the left
      let is_down_button = x < button_width

      // logic: the 'up' button is the last 30px on the right
      let is_up_button = x > (width - button_width)

      if (is_up_button) {
        input.stepUp()
      }
      else {
        if (is_down_button) {
          input.stepDown()
        }
      }

      // trigger change event for other scripts to see
      input.dispatchEvent(new Event(`change`))
    })
  }
}