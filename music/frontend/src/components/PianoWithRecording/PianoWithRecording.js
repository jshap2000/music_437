import React from 'react';
import { Piano } from 'react-piano';
import jQuery from 'jquery'

const DURATION_UNIT = 0.2;
const DEFAULT_NOTE_DURATION = DURATION_UNIT;

class PianoWithRecording extends React.Component {
    static defaultProps = {
      notesRecorded: false,
    };

    constructor (props){
      super(props);
      this.ref = React.createRef();
      this.state = {
        keysDown: {},
        noteDuration: DEFAULT_NOTE_DURATION,
        timerStart: 0
      };

      this.componentDidMount = this.componentDidMount.bind(this);
      

    }



  onPlayNoteInput = midiNumber => {
    this.setState({
      notesRecorded: false,
    });
  };

  

  


  onStopNoteInput = (midiNumber, { prevActiveNotes }) => {
    if (this.state.notesRecorded === false) {
      console.log("prev active notes")
      console.log(prevActiveNotes)
      this.recordNotes(prevActiveNotes, this.state.noteDuration);
      this.setState({
        notesRecorded: true,
        noteDuration: DEFAULT_NOTE_DURATION,
      });
    }
  };

  
  recordNotes = (midiNumbers, duration) => {
    if (this.props.recording.mode !== 'RECORDING') {return;}
    console.log(midiNumbers);
    const newEvents = midiNumbers.map(midiNumber => {
     
      // If the user hit clear, add notes from time: 0
      if (this.props.recording.events.length === 0 && this.state.timerStart !== 0) {
        this.setState({timerStart: Date.now()})
        return {
          midiNumber,
          time: 0,
          duration: duration
        };
      } 

      // If user is playing for the first time, add notes from time: 0
      if (this.state.timerStart === 0) {
        this.setState({timerStart: Date.now()})
        return {
          midiNumber,
          time: 0,
          duration: duration
        };
      }

      // Otherwise add notes from time: timerStart
      return {
        midiNumber,
        time: this.toMiliseconds(Date.now() - this.state.timerStart),
        duration: duration
      };
    });

    this.props.setRecording({
      events: this.props.recording.events.concat(newEvents),
      timerOn: true
    });
  };

  toMiliseconds(dateTime) {return dateTime * 0.001;}

  onMIDISuccess = (midiAccess) => {
    for (var input of midiAccess.inputs.values()) {
      input.onmidimessage = this.getMIDIMessage;
    }
  }

  getMIDIMessage = (message) => {
    var command = message.data[0];
    var note = message.data[1];
    var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command
    
    switch (command) {
        case 144: 
            console.log(note);
            
            this.props.playNote(note);
            this.recordNotes([note],0.2)
            break;
            
        case 128: // noteOff
            //noteOff(note);
            //console.log(note);
            break;
        // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
    }
  }

  componentDidMount = () => {

    navigator.requestMIDIAccess()
    .then(this.onMIDISuccess, onMIDIFailure);

    

    function onMIDIFailure() {
        console.log('Could not access your MIDI devices.');
    }

    
  }

  

  render() {
    const {
      playNote,
      stopNote,
      recording,
      setRecording,
      ...pianoProps
    } = this.props;

    const { mode, currentEvents } = this.props.recording;
    const activeNotes =
      mode === 'PLAYING' ? currentEvents.map(event => event.midiNumber) : null;
    return (
      <div >
        
        <Piano 
          playNote={this.props.playNote}
          stopNote={this.props.stopNote}
          onPlayNoteInput={this.onPlayNoteInput}
          onStopNoteInput={this.onStopNoteInput}
          activeNotes={activeNotes}
          {...pianoProps}
        />
         
      </div>
     
    );
  }
}

export default PianoWithRecording;
