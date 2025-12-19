App.new_beat = () => {
  App.show_confirm({
    title: `New Beat`,
    message: `Clear and write a beat from scratch`,
    ok_action: () => {
      App.last_code = ``
      App.current_song = ``
      App.beat_title = ``
      App.set_input(``)
      App.stop_action()
      App.focus_input()
    },
  })
}