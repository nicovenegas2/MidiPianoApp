import { useEffect, useState } from 'react'
import Octave from './components/Octave'
import { streak } from './Functions/streaks'
import './App.css'

const OCTAVES = 6
const MIN_NOTE = 21
const KEYBOARD_NOTES = [
  ['a', 'Do', 60], ['w', 'Do♯', 61], ['s', 'Re', 62],
  ['e', 'Re♯', 63], ['d', 'Mi', 64], ['f', 'Fa', 65],
  ['t', 'Fa♯', 66], ['g', 'Sol', 67], ['y', 'Sol♯', 68],
  ['h', 'La', 69], ['u', 'La♯', 70], ['j', 'Si', 71],
]
const KEY_MAP = new Map(KEYBOARD_NOTES.map(([key, , note]) => [key, note]))

function App() {
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    const wrapper = document.querySelector('.wrapper')
    const resize = () => {
      wrapper.style.transform = `scaleX(${window.innerWidth / wrapper.scrollWidth})`
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const activeNotes = new Map()
    const heldKeys = new Set()
    const inputs = new Set()
    let midiAccess
    let disposed = false

    function setNote(note, source, pressed) {
      const key = document.getElementById(String(note - MIN_NOTE))
      if (!key) return
      const sources = activeNotes.get(note) || new Set()
      if (pressed) {
        if (sources.size === 0) {
          key.classList.add('press')
          streak(key)
        }
        sources.add(source)
        activeNotes.set(note, sources)
      } else {
        sources.delete(source)
        if (sources.size === 0) {
          key.classList.remove('press')
          activeNotes.delete(note)
        }
      }
    }

    function releaseSource(source) {
      for (const note of activeNotes.keys()) setNote(note, source, false)
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') setHelpOpen(false)
      if (event.ctrlKey || event.metaKey || event.altKey ||
          event.target.closest('input, textarea, select, [contenteditable="true"]')) return
      const key = event.key.toLowerCase()
      const note = KEY_MAP.get(key)
      if (note === undefined) return
      event.preventDefault()
      if (heldKeys.has(key)) return
      heldKeys.add(key)
      setNote(note, 'keyboard', true)
    }

    function onKeyUp(event) {
      const key = event.key.toLowerCase()
      if (!heldKeys.delete(key)) return
      setNote(KEY_MAP.get(key), 'keyboard', false)
    }

    function releaseKeyboard() {
      heldKeys.clear()
      releaseSource('keyboard')
    }

    function onVisibilityChange() {
      if (document.hidden) releaseKeyboard()
    }

    function onMIDIMessage(event) {
      const [status, note, velocity = 0] = event.data
      const command = status & 0xf0
      const source = `midi:${event.target.id}:${status & 0x0f}`
      if (command === 0x90) setNote(note, source, velocity > 0)
      else if (command === 0x80) setNote(note, source, false)
    }

    function syncInputs() {
      for (const input of inputs) {
        if (input.state === 'disconnected') {
          input.removeEventListener('midimessage', onMIDIMessage)
          inputs.delete(input)
          for (let channel = 0; channel < 16; channel++) {
            releaseSource(`midi:${input.id}:${channel}`)
          }
        }
      }
      for (const input of midiAccess.inputs.values()) {
        if (input.state !== 'disconnected' && !inputs.has(input)) {
          input.addEventListener('midimessage', onMIDIMessage)
          inputs.add(input)
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseKeyboard)
    document.addEventListener('visibilitychange', onVisibilityChange)
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(access => {
        if (disposed) return
        midiAccess = access
        syncInputs()
        midiAccess.addEventListener('statechange', syncInputs)
      }).catch(error => console.warn('No se pudo acceder al MIDI:', error))
    }

    return () => {
      disposed = true
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', releaseKeyboard)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      midiAccess?.removeEventListener('statechange', syncInputs)
      for (const input of inputs) input.removeEventListener('midimessage', onMIDIMessage)
      for (const note of activeNotes.keys()) {
        document.getElementById(String(note - MIN_NOTE))?.classList.remove('press')
      }
    }
  }, [])

  return (
    <>
      <button className="help-button" type="button" aria-label="Ayuda: teclas del computador"
        aria-expanded={helpOpen} aria-controls="keyboard-help"
        onClick={() => setHelpOpen(open => !open)}>?</button>
      {helpOpen && (
        <aside className="help-panel" id="keyboard-help" aria-labelledby="help-title">
          <h2 id="help-title">Teclado del computador</h2>
          <p>Toca la octava central (Do4–Si4). Mantén una tecla para sostener la nota; puedes tocar varias a la vez.</p>
          <dl className="key-map">
            {KEYBOARD_NOTES.map(([key, name]) => (
              <div key={key}><dt><kbd>{key.toUpperCase()}</kbd></dt><dd>{name}</dd></div>
            ))}
          </dl>
          <p>También puedes conectar un teclado MIDI. Pulsa ? o Escape para cerrar esta ayuda.</p>
        </aside>
      )}
      <div className="wrapper">
        {Array.from({ length: OCTAVES }, (_, i) => <Octave key={i} offset={12 * i} />)}
      </div>
    </>
  )
}

export default App
