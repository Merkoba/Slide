App.tempo_storage_key = `slide.tempoCpm`
App.endpoint_storage_key = `slide.statusEndpoint`
App.fetch_delay_storage_key = `slide.fetchDelaySeconds`
App.tempo_storage_key = `slide.tempoCpm`
App.volume_storage_key = `slide.volumePercent`

App.load_all_storage = () => {
  App.stor_load_auto_endpoint()
  App.stor_load_auto_delay()
}

App.stor_load_auto_endpoint = () => {
  App.load_storage(`endpoint`,
    (value) => {
      App.auto_endpoint = value
    }
  )
}

App.stor_load_auto_delay = () => {
  App.load_storage(`delay`,
    (value) => {
      App.auto_delay = value
    }
  )
}

App.load_storage = (what, on_value) => {
  let value = localStorage.getItem(App[`${what}_storage_key`])
  on_value(value)
}