(function() {
  let OriginalAudioContext = window.AudioContext || window.webkitAudioContext

  function create_reverb_buffer(ctx, duration = 3, decay = 2) {
    let rate = ctx.sampleRate
    let length = rate * duration
    let impulse = ctx.createBuffer(2, length, rate)
    let left = impulse.getChannelData(0)
    let right = impulse.getChannelData(1)

    for (let i = 0; i < length; i++) {
      let n = i / length
      let volume = Math.pow(1 - n, decay)
      left[i] = (Math.random() * 2 - 1) * volume
      right[i] = (Math.random() * 2 - 1) * volume
    }

    return impulse
  }

  class InterceptedAudioContext extends OriginalAudioContext {
    constructor(...args) {
      if (window.master_fx && window.master_fx.context) {
        return window.master_fx.context
      }

      super(...args)
      let ctx = this
      let is_main_context = !window.master_fx

      // --- 1. Create Nodes ---

      // The "Underwater" Filter
      let filter_node = ctx.createBiquadFilter()
      filter_node.type = `lowpass`
      filter_node.frequency.value = 22050 // Start fully open (transparent)
      filter_node.Q.value = 0

      let eq_low = ctx.createBiquadFilter()
      eq_low.type = `lowshelf`
      eq_low.frequency.value = 320
      eq_low.gain.value = 0

      let eq_mid = ctx.createBiquadFilter()
      eq_mid.type = `peaking`
      eq_mid.frequency.value = 1000
      eq_mid.Q.value = 1.0
      eq_mid.gain.value = 0

      let eq_high = ctx.createBiquadFilter()
      eq_high.type = `highshelf`
      eq_high.frequency.value = 4000
      eq_high.gain.value = 0

      let panner_node = ctx.createStereoPanner()
      panner_node.pan.value = 0

      // LFO for auto-panning
      let lfo = ctx.createOscillator()
      lfo.type = `sine`
      lfo.frequency.value = 0

      let lfo_gain = ctx.createGain()
      lfo_gain.gain.value = 0

      lfo.connect(lfo_gain)
      lfo_gain.connect(panner_node.pan)
      lfo.start()

      // Reverb Setup
      let convolver = ctx.createConvolver()
      convolver.buffer = create_reverb_buffer(ctx)

      let reverb_gain = ctx.createGain()
      reverb_gain.gain.value = 0

      let master_gain = ctx.createGain()
      master_gain.gain.value = 1.0

      let analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      let buffer_length = analyser.frequencyBinCount
      let data_array = new Uint8Array(buffer_length)

      // --- 2. Routing ---

      // Chain: Input -> Filter -> EQ -> Panning -> Master
      filter_node.connect(eq_low)
      eq_low.connect(eq_mid)
      eq_mid.connect(eq_high)
      eq_high.connect(panner_node)
      panner_node.connect(master_gain)

      // Master -> Analyser -> Speakers
      master_gain.connect(analyser)
      analyser.connect(super.destination)

      // --- 3. Compatibility ---

      // We expose the filter as the "destination" input so all sound goes through it first
      Object.defineProperty(filter_node, `maxChannelCount`, {
        get: () => super.destination.maxChannelCount,
      })

      Object.defineProperty(ctx, `destination`, {
        get: () => filter_node,
        configurable: true,
      })

      // --- 4. Expose Controls ---

      if (is_main_context) {
        let reverb_state = {
          timer: null,
          is_connected: false,
        }

        window.master_fx = {
          context: ctx,
          nodes: {
            filter: filter_node,
            eq_low,
            eq_mid,
            eq_high,
            panner: panner_node,
            reverb_gain,
            master_gain,
            lfo,
            lfo_gain,
            analyser,
          },
          toggle_cutoff: (enable) => {
            let now = ctx.currentTime
            let ramp_time = 0.4

            if (enable) {
              // Muffle sound: Drop freq to 600Hz, Boost Resonance (Q) to 10
              filter_node.frequency.setTargetAtTime(600, now, ramp_time)
              filter_node.Q.setTargetAtTime(10, now, ramp_time)
            }
            else {
              // Open sound: Raise freq to 22kHz, Drop Resonance to 0
              filter_node.frequency.setTargetAtTime(22050, now, ramp_time)
              filter_node.Q.setTargetAtTime(0, now, ramp_time)
            }
          },
          get_volume: () => {
            analyser.getByteTimeDomainData(data_array)
            let sum = 0

            for (let i = 0; i < buffer_length; i++) {
              let x = (data_array[i] - 128) / 128
              sum += x * x
            }
            return Math.sqrt(sum / buffer_length)
          },
          set_eq: (low_db, mid_db, high_db) => {
            let now = ctx.currentTime
            let ramp = 0.1
            if (low_db !== undefined) eq_low.gain.setTargetAtTime(low_db, now, ramp)
            if (mid_db !== undefined) eq_mid.gain.setTargetAtTime(mid_db, now, ramp)
            if (high_db !== undefined) eq_high.gain.setTargetAtTime(high_db, now, ramp)
          },
          set_volume: (val) => {
            master_gain.gain.setTargetAtTime(val, ctx.currentTime, 0.1)
          },
          set_panning: (val) => {
            panner_node.pan.setTargetAtTime(val, ctx.currentTime + 0.02, 0.1)
          },
          set_auto_pan: (rate_hz, depth) => {
            let now = ctx.currentTime
            lfo.frequency.setTargetAtTime(rate_hz, now, 0.1)
            lfo_gain.gain.setTargetAtTime(depth, now, 0.1)
          },
          toggle_reverb: (enable, volume = 0.5) => {
            let now = ctx.currentTime
            let ramp = 0.1

            if (enable) {
              if (!reverb_state.is_connected) {
                panner_node.connect(convolver)
                convolver.connect(reverb_gain)
                reverb_gain.connect(master_gain)
                reverb_gain.gain.setValueAtTime(0, now)
                reverb_state.is_connected = true
              }
              reverb_gain.gain.setTargetAtTime(volume, now, ramp)
            }
            else {
              reverb_gain.gain.setTargetAtTime(0, now, ramp)
              setTimeout(() => {
                if (reverb_gain.gain.value === 0) {
                  reverb_gain.disconnect()
                  convolver.disconnect()
                  reverb_state.is_connected = false
                }
              }, 500)
            }
          },
        }
      }
    }
  }

  window.AudioContext = InterceptedAudioContext
  if (window.webkitAudioContext) {
    window.webkitAudioContext = InterceptedAudioContext
  }
})()