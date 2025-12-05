App.create_auto_modal = () => {
  let modal = App.create_modal(`auto`)
  let title = DOM.el(`.modal-title`, modal)
  title.textContent = `Auto Mode`
  let body = DOM.el(`.modal-body`, modal)
  let info = DOM.create(`div`)
  info.textContent = `Code will be fetched periodically`
  let select = DOM.create(`select`)
  select.id = `auto-delay-select`

  select.innerHTML = `
    <option value="1">1 second</option>
    <option value="5" selected>5 seconds</option>
    <option value="10">10 seconds</option>
    <option value="30">30 seconds</option>
    <option value="60">1 minute</option>
    <option value="300">5 minutes</option>
    <option value="600">10 minutes</option>
    <option value="900">15 minutes</option>
    <option value="1200">20 minutes</option>
    <option value="1800">30 minutes</option>
    <option value="3600">1 hour</option>
  `

  let input = DOM.create(`input`)
  input.id = `auto-input`
  input.placeholder = `Endpoint URL`
  let buttons = DOM.create(`auto-buttons`)

  buttons.innerHTML = `
    <button id="endpoint-default">Default</button>
    <button id="endpoint-start">Start</button>
  `

  body.appendChild(info)
  body.appendChild(input)
  body.appendChild(buttons)
}

App.open_auto_modal = () => {
  App.open_modal(`auto`)
}