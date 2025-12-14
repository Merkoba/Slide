App.is_playing = false
App.play_running = false

App.setup_player = () => {
  App.setup_drawer()
  App.setup_time_controls()
  App.setup_cycle()
}

App.reset_playing = () => {
  App.play_running = false
}

App.play_action = async (code = ``, force = false) => {
  console.info(`🔮 Play Action`)

  if (App.play_running) {
    return
  }

  App.play_running = true
  App.update_url()
  let ready = await App.ensure_strudel_ready()

  if (!ready) {
    App.reset_playing()
    return
  }

  if (!code) {
    code = App.get_input_value()
  }

  if (!code) {
    App.last_code = ``
    App.current_song = ``
    App.reset_playing()
    App.stop_action()
    return
  }

  if (!force && (code === App.last_code)) {
    App.reset_playing()
    return
  }

  App.is_playing = true
  App.restart_code_scroll(false)
  App.stor_save_code()
  App.clear_draw_context()
  App.start_color_cycle()
  App.clean_canvas()
  App.update_title()

  try {
    await App.strudel_update(code)
  }
  catch (e) {
    App.set_status(`Error: ${e.message}`)
  }

  App.reset_playing()
}

App.stop_action = () => {
  console.info(`🔮 Stop Action`)
  App.is_playing = false
  App.stop_strudel()
  App.stop_code_scroll()
  App.clear_draw_context()
  App.set_song_context(``)
  App.playing()
}

App.stop_strudel = () => {
  App.stop_color_cycle()
  App.clear_draw_context()
  App.scheduler.stop()
  App.stop_drawer()
  App.clean_mirror()
  App.clean_canvas()
}

App.strudel_update = async (code) => {
  if (!App.audio_started) {
    console.warn(`Audio not started yet. Call strudel_init() first.`)
    return
  }

  console.info(`Updating 💨`)
  await App.ensure_scope()
  App.set_song_tempo(code)
  App.update_url()
  let full_result = await App.run_eval(code)

  if (full_result.ok) {
    App.playing()
    return
  }

  if (App.do_partial_updates) {
    let partial_applied = await App.apply_partial_update(code)

    if (partial_applied) {
      return
    }
  }

  App.report_eval_failure(full_result.error)
}

App.playing = (extra) => {
  if (App.is_playing) {
    App.set_play_status(extra)
  }
  else {
    App.set_stop_status(extra)
  }
}

App.set_play_status = (extra) => {
  let msg = ``
  let name = App.get_song_name(true)

  if (name) {
    msg = `Playing: ${name}`
  }

  if (!msg) {
    if (App.fetch_timer) {
      msg = `Playing 🤖`
    }
    else if (App.beat_title) {
      msg = `Playing: ${App.beat_title}`
    }
    else if (App.is_url_beat()) {
      msg = `Playing 🌐`
    }
    else {
      msg = `Playing 🥁`
    }
  }

  if (extra) {
    msg = `${msg} - ${extra}`.trim()
  }

  App.set_status(msg)
}

App.set_stop_status = () => {
  let name = App.get_song_name(true)

  if (name) {
    App.set_status(`Stopped: ${name}`)
  }
  else if (App.beat_title) {
    App.set_status(`Stopped: ${App.beat_title}`)
  }
  else if (App.is_url_beat()) {
    App.set_status(`Stopped 🌐`)
  }
  else {
    App.set_status(`Stopped`)
  }
}

App.load_last_code = () => {
  if (!App.last_code) {
    return
  }

  App.set_input(App.last_code)
}

App.restart_code_scroll = (to_top = true) => {
  if (to_top) {
    App.scroll_input_to_top()
  }

  if (App.code_scroll_active) {
    App.defer_code_scroll(App.code_scroll_song_pause_ms)
    App.reset_code_scroll_for_content(App.code_scroll_song_pause_ms)
  }
}

// 1. Export a setup function to the global window object
// This allows your HTML/Flask templates to call it easily.
App.strudel_init = async () => {
  if (App.audio_started) {
    console.info(`Audio already initialized`)
    return
  }

  console.info(`Initializing Audio...`)

  try {
    console.info(`Loading scope...`)
    await App.ensure_scope()
    console.info(`Scope loaded`)

    // This must be called in response to a user interaction
    console.info(`Initializing audio context...`)
    await initAudio()

    // Enable mini-notation for strings
    strudelMini.miniAllStrings()

    // Load samples and sounds in parallel
    let ds = `https://raw.githubusercontent.com/felixroos/dough-samples/main`

    console.info(`Loading samples and soundfonts...`)

    await Promise.all([
      registerSynthSounds(),
      registerSoundfonts(),
      samples(`github:tidalcycles/dirt-samples`),
      samples(`${ds}/tidal-drum-machines.json`),
    ])

    App.audio_started = true
    App.apply_volume()
    console.info(`Audio Ready.`)

    if (App.code_to_play) {
      App.play_action(App.code_to_play)
      App.code_to_play = ``
    }

    App.playing()
  }
  catch (err) {
    console.error(`Audio Failed:`, err)
    throw err
  }
}

App.run_eval = async (code) => {
  App.reset_eval_state()
  code = App.filter_code(code)
  App.last_code = code
  App.set_input(code)

  try {
    App.seek_offset = 0
    App.pattern = await App.evaluate(code)
    App.start_drawer()
  }
  catch (err) {
    return {ok: false, error: err}
  }

  if (App.has_error) {
    return {ok: false, error: new Error(App.last_eval_error || `Evaluation error`)}
  }

  return {ok: true}
}

App.rewind_player = (seconds = 2) => {
  // Get current tempo (default to 1 if unknown)
  // 'scheduler.cps' is usually available, or check your specific state
  let current_cps = App.scheduler.cps || 1

  // Convert real seconds to Strudel cycles
  let cycles_to_shift = seconds * current_cps

  // Add to offset (Delaying the stream = moving back in time)
  App.seek_offset += cycles_to_shift
  App.update_playback()
}

App.forward_player = (seconds = 2) => {
  let current_cps = App.scheduler.cps || 1
  let cycles_to_shift = seconds * current_cps

  // Subtract from offset (Advancing the stream = skipping ahead)
  App.seek_offset -= cycles_to_shift
  App.update_playback()
}

App.update_playback = () => {
  // Apply the total calculated offset
  if (App.pattern) {
    App.scheduler.setPattern(App.pattern.late(App.seek_offset))
  }
}

App.setup_time_controls = () => {
  let rewind = DOM.el(`#time-rewind`)
  let forward = DOM.el(`#time-forward`)

  DOM.ev(rewind, `click`, () => {
    App.rewind_player()
  })

  DOM.ev(forward, `click`, () => {
    App.forward_player()
  })

  App.remove_context(rewind)
  App.remove_context(forward)
}

App.update_ui_loop = () => {
  if (!App.scheduler) {
    return requestAnimationFrame(App.update_ui_loop)
  }

  let current_time = App.scheduler.now()
  let cps = App.scheduler.cps || 1
  let virtual_cycles = (current_time * cps) - App.seek_offset
  let phase = virtual_cycles % 1

  if (phase < 0) {
    phase += 1
  }

  let slider = DOM.el(`#cycle-slider`)

  if (slider && document.activeElement !== slider) {
    slider.value = phase
  }

  requestAnimationFrame(App.update_ui_loop)
}

App.setup_cycle = () => {
  App.on_slider_change = (target_phase) => {
    let current_time = App.audio_ctx.currentTime
    let cps = App.scheduler.cps || 1

    // 1. Calculate current Virtual Time to find which "Measure" we are in
    let current_virtual = (current_time * cps) - App.seek_offset

    // 2. Get the integer part (The measure number, e.g., 42)
    let current_measure = Math.floor(current_virtual)

    // 3. Construct the NEW Virtual Time
    // Measure 42 + Slider 0.5 = 42.5
    let new_virtual = current_measure + target_phase

    // 4. Reverse calculate the Offset needed to achieve this time
    // Offset = Real - Virtual
    App.seek_offset = (current_time * cps) - new_virtual

    // 5. Apply
    App.update_playback()
  }

  // Bind the event
  DOM.ev(`#cycle-slider`, `input`, (e) => {
    App.on_slider_change(parseFloat(e.target.value))
  })

  App.update_ui_loop()
}