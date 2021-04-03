import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import {gradeUser} from './components/Grading/Grading.js';
import MusicUpload from './components/MusicUpload/MusicUpload.js';
import reportWebVitals from './components/reportWebVitals/reportWebVitals.js';

import DimensionsProvider from './components/DimensionsProvider/DimensionsProvider.js';
import SoundfontProvider from './components/SoundfontProvider/SoundfontProvider.js';
import PianoWithRecording from './components/PianoWithRecording/PianoWithRecording.js';
import Select from 'react-select'
import axios from 'axios';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;


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

class App extends React.Component {
  state = {
    recording: {
      mode: 'RECORDING',
      events: [],
      currentTime: 0,
      currentEvents: [],
    },
    selectOptions: [],
    title: "",
  };

  constructor(props) {
    super(props);

    this.scheduledEvents = [];
  }

  getRecordingEndTime = () => {
    if (this.state.recording.events.length === 0) {
      return 0;
    }
    return Math.max(
      ...this.state.recording.events.map(event => event.time + event.duration),
    );
  };

  setRecording = value => {
    this.setState({
      recording: Object.assign({}, this.state.recording, value),
    });
  };

  onClickPlay = () => {
    this.setRecording({
      mode: 'PLAYING',
    });
    const startAndEndTimes = _.uniq(
      _.flatMap(this.state.recording.events, event => [
        event.time,
        event.time + event.duration,
      ]),
    );
    startAndEndTimes.forEach(time => {
      this.scheduledEvents.push(
        setTimeout(() => {
          const currentEvents = this.state.recording.events.filter(event => {
            return event.time <= time && event.time + event.duration > time;
          });
          this.setRecording({
            currentEvents,
          });
        }, time * 1000),
      );
    });
    // Stop at the end
    setTimeout(() => {
      this.onClickStop();
    }, this.getRecordingEndTime() * 1000);
  };

  onClickStop = () => {
    this.scheduledEvents.forEach(scheduledEvent => {
      clearTimeout(scheduledEvent);
    });
    this.setRecording({
      mode: 'RECORDING',
      currentEvents: [],
    });
  };

  onClickClear = () => {
    this.onClickStop();
    this.setRecording({
      events: [],
      mode: 'RECORDING',
      currentEvents: [],
      currentTime: 0,
    });
  };

  onClickGrade = () => {
    var i = 0;
    while (this.state.selectOptions[i]){
      if (this.state.selectOptions[i].value == this.state.title) {  
        var grade = gradeUser(this.state.selectOptions[i].notes, this.state.recording.events);
        break;
      }
      i++;
    }
    return grade;
  };
   
  componentWillMount() {
    this.getOptions()
  }

  async getOptions() {
    const res = await axios.get('/playable_pieces');
    console.log(res);
    const data = res.data.results;

    const options = data.map(d => ({
      "value" : d.title,
      "label" : d.title,
      "notes" : d.notes
    }));
    this.setState({selectOptions: options})
  }

  handleOptionsChange(val){
    this.setState({title: val.value});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    let form_data = new FormData();
    console.log(this.state.recording.events);
    form_data.append('title', this.state.title);
    form_data.append('notes', JSON.stringify(this.state.recording.events));
    console.log(form_data);
    let url = '/user_pieces/';
    axios.post(url, form_data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
        .then(res => {
          console.log(res.data);
        })
        .catch(err => console.log(err))
  };

  render() {
    return (
      <div>
        <div>
          <Select options={this.state.selectOptions} onChange={this.handleOptionsChange.bind(this)}/>
        </div>
        <h1 className="h3">react-piano recording + playback demo</h1>
        <div className="mt-5">
          <SoundfontProvider
            instrumentName="acoustic_grand_piano"
            audioContext={audioContext}
            hostname={soundfontHostname}
            render={({ isLoading, playNote, stopNote }) => (
              <PianoWithRecording
                recording={this.state.recording}
                setRecording={this.setRecording}
                noteRange={noteRange}
                width={300}
                playNote={playNote}
                stopNote={stopNote}
                disabled={isLoading}
                keyboardShortcuts={keyboardShortcuts}
              />
            )}
          />
        </div>
        <div className="mt-5">
          <button onClick={this.onClickPlay}>Play</button>
          <button onClick={this.onClickStop}>Stop</button>
          <button onClick={this.onClickClear}>Clear</button>
          <button onClick={this.onClickGrade}>Grade</button>
        </div>
        <div className="mt-5">
          <strong>Recorded notes</strong>
          <div>{JSON.stringify(this.state.recording.events)}</div>
        </div>
      <div>
        <form onSubmit={this.handleSubmit}>
          <input type="submit"/>
        </form>
      </div>
      </div>
      
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);