App.play_action = async (code = ``, force = false) => {
  let ready = await App.ensure_strudel_ready()

  if (!ready) {
    return
  }

  if (!code) {
    let code_input = App.get_input()
    code = code_input.value
  }

  if (!code) {
    return
  }

  if (!force && (code === App.last_code)) {
    return
  }

  // --- CHANGED SECTION START ---

  // 1. Force silence
  App.stop_strudel()
  let ctx = App.get_audio_context()

  // 2. If you have access to the web audio context (often ctx or audioContext)
  // This kills any lingering reverb tails or long samples instantly
  if (ctx && (ctx.state === `running`)) {
    await ctx.suspend()
  }

  // --- CHANGED SECTION END ---

  App.restart_code_scroll()
  App.last_code = code
  App.clear_draw_context()
  App.start_color_cycle()
  App.clean_canvas()

  try {
    await App.strudel_update(code)
  }
  catch (e) {
    App.set_status(`Error: ${e.message}`)
  }

  // Small timeout to ensure the hardware buffer clears
  await new Promise(r => setTimeout(r, 10))
  await ctx.resume()
}

App.stop_action = () => {
  if (!App.stop_strudel) {
    App.set_status(`Bundle not loaded. Cannot stop audio`)
    return
  }

  if (App.strudel_stop_status_watch) {
    App.strudel_stop_status_watch()
  }

  App.stop_strudel()
  App.stop_code_scroll()
  App.last_code = null
  App.clear_draw_context()
  App.set_status(`Stopped`)
  App.set_song_context()
}

App.stop_strudel = () => {
  App.stop_color_cycle()
  App.clear_draw_context()
  App.scheduler.stop()
  App.clean_canvas()
  let ctx = App.get_audio_context()

  if (ctx && (ctx.state === `running`)) {
    ctx.suspend()
  }
}

App.strudel_update = async (code) => {
  if (!App.audio_started) {
    console.warn(`Audio not started yet. Call strudel_init() first.`)
    return
  }

  console.info(`Updating 💨`)
  await App.ensure_scope()

  App.set_tempo()
  const full_result = await App.run_eval(code)

  if (full_result.ok) {
    App.playing()
    return
  }

  if (App.do_partial_updates) {
    const partial_applied = await App.apply_partial_update(code)

    if (partial_applied) {
      return
    }
  }

  App.report_eval_failure(full_result.error)
}