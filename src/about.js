App.create_about_modal = () => {
  let modal = App.create_modal(`about`)
  let title = DOM.el(`.modal-title`, modal)
  // let version = `v${App.config.version}`
  let version = `v1.0`
  title.textContent = `Slide ${version} | Merkoba | 2025`
  let body = DOM.el(`.modal-body`, modal)

  body.innerHTML = `
    <p>Slide is a player for <a target=_blank class="popup" href="https://strudel.cc">strudel</a> code.</p>
    <p>It's meant to allow automatic & seamless code updates.</a></p>
    <p>There's a song picker to play elaborate tunes.</a></p>
    <p>The code can be edited in real time and applied with Play.</a></p>
  `
}

App.open_about_modal = () => {
  App.open_modal(`about`)
}
