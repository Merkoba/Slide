App.create_visual_modal = () => {
  let modal = App.create_modal(`visual`)
  let title = DOM.el(`.modal-title`, modal)
  title.textContent = `Select Visual`
}

App.open_visual_modal = async () => {
  let items = [
    `Auto`,
    `None`,
    `Hydra`,
    `Scope`,
    `Pianoroll`,
  ]

  App.show_items_modal(`visual`, {
    items,
    action: (item) => {
      let mode = item.toLowerCase()
      App.apply_visual(mode)
    },
  })
}

App.apply_visual = (mode) => {
  console.log(mode)
}