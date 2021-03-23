import React from 'react';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';

//import DimensionsProvider from '../DimensionsProvider/DimensionsProvider'
import SoundfontProvider from '../SoundfontProvider/SoundfontProvider.js'

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

const noteRange = {
  first: MidiNumbers.fromNote('c3'),
  last: MidiNumbers.fromNote('f4'),
};
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

export default class BasicPiano extends React.Component {
  state = {
    selectOptions: [],
    title: "",
    midi: null
  }

  render(){
    return (
      <div>
        <SoundfontProvider
          instrumentName="acoustic_grand_piano"
          audioContext={audioContext}
          hostname={soundfontHostname}
          render={({ isLoading, playNote, stopNote }) => (
            <Piano
              noteRange={noteRange}
              width={800}
              playNote={playNote}
              stopNote={stopNote}
              disabled={isLoading}
              keyboardShortcuts={keyboardShortcuts}
            />
          )}
        />
        </div>
    );
  }
  }

  