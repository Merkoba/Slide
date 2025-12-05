App.show_items_modal = async (what, args = {}) => {
  let loaded = args.loaded || false
  let modal = DOM.el(`#${what}-modal`)
  let items = DOM.el(`#${what}-list`)
  let filter_input = DOM.el(`#${what}-filter`)

  modal.classList.add(`active`)

  if (loaded) {
    items.innerHTML = `<div class="loading">Loading items...</div>`
  }

  if (filter_input) {
    filter_input.value = ``
    filter_input.disabled = true
    filter_input.oninput = null
    filter_input.onkeydown = null
  }

  if (!args.items.length) {
    items.innerHTML = `<div class="loading">Nothing found</div>`
    return
  }

  let render_items = (list) => {
    items.innerHTML = ``

    if (!list.length) {
      items.innerHTML = `<div class="loading">No results</div>`
      return
    }

    for (let item of list) {
      let item_div = DOM.create(`div`)
      item_div.className = `modal-item`
      item_div.textContent = App.underspace(item)
      DOM.ev(item_div, `click`, () => args.action(item))
      items.appendChild(item_div)
    }
  }

  render_items(args.items)

  if (!filter_input) {
    return
  }

  let apply_filter = () => {
    let query = filter_input.value.trim().toLowerCase()

    if (!query) {
      render_items(args.items)
      return
    }

    let filtered = args.items.filter((item) => item.toLowerCase().includes(query))
    render_items(filtered)
  }

  filter_input.disabled = false
  filter_input.focus()
  filter_input.oninput = apply_filter

  filter_input.onkeydown = (event) => {
    if (event.key !== `Enter`) {
      return
    }

    event.preventDefault()
    let all_items = DOM.els(`.modal-item`, items)

    for (let item of all_items) {
      item.click()
      break
    }
  }
}