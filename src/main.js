import './process-env.js'
import * as strudelCore from '@strudel.cycles/core'
import * as strudelMini from '@strudel.cycles/mini'
import * as strudelWebAudio from '@strudel.cycles/webaudio'

const { evalScope } = strudelCore

// Import initAudio from superdough instead of webaudio
import { initAudio, samples } from 'superdough'
import { webaudioRepl } from '@strudel.cycles/webaudio'

const { evaluate } = webaudioRepl()

let App = window.App

if (!App) {
    App = {}
    window.App = App
}

let scopePromise

let statusPollTimer
let lastStatusCode
let statusPollInFlight = false

const ensureStrudelScope = () => {
    if (!scopePromise) {
        scopePromise = evalScope(strudelCore, strudelMini, strudelWebAudio).catch((err) => {
            scopePromise = undefined
            console.error(`Strudel scope failed to load`, err)
            throw err
        })
    }

    return scopePromise
}

let audioStarted = false

// 1. Export a setup function to the global window object
// This allows your HTML/Flask templates to call it easily.
window.strudel_init = async () => {
    if (audioStarted) {
        return
    }

    console.log(`Initializing Audio...`)

    try {
        await ensureStrudelScope()
        // This must be called in response to a user interaction
        await initAudio()

        // Enable mini-notation for strings
        strudelMini.miniAllStrings()

        // Load default samples
        await samples('github:tidalcycles/dirt-samples')

        audioStarted = true
        console.log(`Audio Ready.`)
    }
    catch (err) {
        console.error(`Audio Failed:`, err)
        throw err
    }
}

// 2. Export the update function
window.strudel_update = (code) => {
    if (!audioStarted) {
        console.warn(`Audio not started yet. Call strudel_init() first.`)
        return
    }

    console.log(`Running:`, code)
    evaluate(code)
}

// 3. Export stop
window.strudel_stop = () => {
    evaluate(`hush`)
}

App.fetchStatusCode = async () => {
    const response = await fetch(`/status`, { cache: `no-store` })

    if (!response.ok) {
        throw new Error(`Status endpoint returned ${response.status}`)
    }

    return response.text()
}

App.strudel_watchStatus = (minutes) => {
    if (!minutes || minutes <= 0) {
        console.warn(`Provide a polling interval in minutes greater than zero`)
        return
    }

    const intervalMs = minutes * 60 * 1000

    const pollStatus = async () => {
        if (statusPollInFlight) {
            return
        }

        if (!audioStarted) {
            console.warn(`Audio not started yet. Call strudel_init() before strudel_watchStatus().`)
            return
        }

        statusPollInFlight = true

        try {
            const code = await App.fetchStatusCode()
            const nextCode = code.trim()

            if (!nextCode) {
                return
            }

            if (nextCode === lastStatusCode) {
                return
            }

            lastStatusCode = nextCode
            window.strudel_update(nextCode)
        }
        catch (err) {
            console.error(`Failed to update Strudel status`, err)
        }
        finally {
            statusPollInFlight = false
        }
    }

    if (statusPollTimer) {
        clearInterval(statusPollTimer)
    }

    pollStatus()

    statusPollTimer = setInterval(() => {
        pollStatus()
    }, intervalMs)
}

window.strudel_watchStatus = App.strudel_watchStatus