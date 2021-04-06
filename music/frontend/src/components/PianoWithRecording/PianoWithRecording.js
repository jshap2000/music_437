import React from 'react';
import { Piano } from 'react-piano';

const DURATION_UNIT = 0.2;
const DEFAULT_NOTE_DURATION = DURATION_UNIT;

class PianoWithRecording extends React.Component {
  static defaultProps = {
    notesRecorded: false,
  };

  state = {
    keysDown: {},
    noteDuration: DEFAULT_NOTE_DURATION,
    timerStart: 0
  };

  onPlayNoteInput = midiNumber => {
    this.setState({
      notesRecorded: false,
    });
  };

  onStopNoteInput = (midiNumber, { prevActiveNotes }) => {
    if (this.state.notesRecorded === false) {
      this.recordNotes(prevActiveNotes, this.state.noteDuration);
      this.setState({
        notesRecorded: true,
        noteDuration: DEFAULT_NOTE_DURATION,
      });
    }
  };

  recordNotes = (midiNumbers, duration) => {
    if (this.props.recording.mode !== 'RECORDING') {return;}

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
      <div>
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
