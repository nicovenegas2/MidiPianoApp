import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Octave from './components/Octave'
import { streak } from './Functions/streaks'
import './App.css'

function App() {
  const [octaves, setOctaves] = useState(6)
  const [minNote, setMinNote] = useState(21)
  let octavesArray = []
  let scale = 1

  if (navigator.requestMIDIAccess){
    navigator.requestMIDIAccess().then(success);
  }

  function success (midi) {
    // GET first input device
    var inputs = midi.inputs
    midi.addEventListener('statechange', update)

    inputs.forEach((input) => {
      input.addEventListener('midimessage', handleMIDIMessage)
    })
  }

  function update (e) {
    // Print information about the (dis)connected MIDI controller
    console.log(e.port.name, e.port.manufacturer, e.port.state)
  }

  function handleMIDIMessage (event) {
    if(event.data[0] != 254){
      const command = event.data[0]
      const note = event.data[1]
      const velocity = (event.data.length > 2) ? event.data[2] : 0
      console.log('MIDI data', command, note-minNote, velocity) // MIDI data [144, 63, 73]

      if (command === 144) {
        const key = document.getElementById(note-minNote)
        // console.log(key)
        if (!key.classList.contains('press')) {
          key.classList.add('press')
          streak(key)
        }
      }

      else if (command === 128) {
        const key = document.getElementById(note-minNote)
        key.classList.remove('press')
      }

    }
  }


  useEffect(() => {
    octavesArray = [...Array(octaves)].map((e, i) => <Octave key={i} offset={12 * i} />)
    

    // get size of window
    const windowWidth = window.innerWidth
    // get width of wrapper
    const wrapper = document.querySelector('.wrapper')
    const wrapperWidth = wrapper.scrollWidth
    // get scale
    scale = windowWidth / wrapperWidth

    console.log('windowWidth', windowWidth)
    console.log('wrapperWidth', wrapperWidth)
    console.log('scale', scale)
    // set scale x
    wrapper.style.transform = `scaleX(${scale})`
  }
  , [octaves])

  return (
    <>
    <div className='wrapper'>
      {
        [...Array(octaves)].map((e, i) => <Octave key={i} offset={12 * i} />)
      }
    </div>
    </>
  )
}

export default App
