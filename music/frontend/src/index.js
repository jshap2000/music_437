import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Select from 'react-select';
import { KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import _ from 'lodash';
import Vex from 'vexflow';
import SoundfontProvider from './components/SoundfontProvider/SoundfontProvider.js';
import PianoWithRecording from './components/PianoWithRecording/PianoWithRecording.js';

import './index.css';
import Button from 'react-bootstrap/Button';
import Card from "react-bootstrap/Card";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row, Col, Navbar, Nav, Form, FormControl} from 'react-bootstrap';

import MusicUpload from './components/MusicUpload/MusicUpload.js';
import GetOptions from './components/GetOptions/GetOptions.js';
import SheetMusicDisplay from './components/SheetMusicDisplay/SheetMusicDisplay.js';
import Grading from './components/Grading/Grading.js';

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

const VF = Vex.Flow;

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

const noteRange = {
  first: MidiNumbers.fromNote('c3'),
  last: MidiNumbers.fromNote('f5'),
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
      timerOn: true,
    },
    selectOptions: [],
    title: "",
    grading: "",
    notes: "",
    time_signature: 4,
    preset:false,
    playing: false,
    actively_playing: false,
    interval: null,
    midi_present: false,
    isUploadFormActive: false,
    uploadTitle: "",
    uploadFile: "",
    newSongAdded: false,
  };

  constructor(props) {
    super(props);
    this.scheduledEvents = [];
  }

  /* Recording Helper ethods - start */

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
    if(this.state.playing === true) {
      this.setState({actively_playing: true})
      //this.afterSetStateFinished();
    }
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
      timerOn: false
    });
    this.setState({
      currentTime: 0
    });
  };

  /* Recording Helper methods - end */
   


  /* Options menu helper methods - start */

  setNewSongAddedTrue = () => {
    this.state.newSongAdded = true;
  }

  setNewSongAddedFalse = () => {
    this.state.newSongAdded = false;
  }

  setOptionsStart = (options) => {
    this.setState({selectOptions: options})
  }

  handleOptionsChange = (val) => {
    this.setState({
      title: val.value, 
      notes: val.notes, 
      grading: val.grading, 
      currentTime: 0, playing: false, 
      time_signature: val.time_signature}, () => { 
        document.getElementById('')
        this.onClickClear();
        this.setState({playing: true});
      });
  }

  /* Options menu helper methods - end */

  /* Grading helper methods start */

  handleExit = () => {
    document.getElementById('not-grading').hidden = "hidden";
  }

  handleReturn = () => {
    document.getElementById('not-grading').hidden = "";
    this.setState({playing: true});
  }

  setActivePlayingFalse = () => {
    this.state.actively_playing = false;
  }

  setPlayingFalse = () => {
    this.state.playing = false;
  }
  executeClearInterval = () => {
    clearInterval(this.state.interval);
  }

  /* Grading helper methods end */



  handleShowUploadForm = () => {
    this.setState(({ isUploadFormActive }) => (
      { isUploadFormActive: !isUploadFormActive }));
  }

  scrollToView() {
    document.getElementById("jumpHere").scrollIntoView({behavior: 'smooth'});
  }

  setWeb = () => {
    this.setState({midi_present: false});
    document.getElementById("Web").style.backgroundColor = "darkgrey";
    document.getElementById("MidiBoard").style.backgroundColor = "white";
  }

  setMidi = () =>  {
    this.setState({midi_present: true});
    document.getElementById("Web").style.backgroundColor = "white";
    document.getElementById("MidiBoard").style.backgroundColor = "darkgrey";
  }

  render() {

    // And get a drawing context:


    return (
      <div id="page">
        <div id="not-grading">
          <Navbar id="navbar" bg="light" variant="light">
            <img id="icon1" src="MusicNote.png" alt="note icon"/>
            <Navbar.Brand >Piano Practice</Navbar.Brand>
            <Nav className="mr-auto">
              <img id="icon2" src="webkeyboard.png" alt="midi icon"/>
              <Nav.Link id = 'Web' onClick={this.setWeb}>Web Keyboard</Nav.Link>
              <img id="icon3" src="midikeyboard.png" alt="webkey icon"/>
              <Nav.Link  id= 'MidiBoard' onClick={this.setMidi}>Midi Keyboard</Nav.Link>
              <div id='uploadBar'><MusicUpload setOptionsStart={this.setOptionsStart} setNewSongAddedTrue={this.setNewSongAddedTrue}> </MusicUpload></div>
              
            </Nav>
            <div id="op">
              <div id='options'>
                <GetOptions options={this.state.selectOptions} setOptionsStart={this.setOptionsStart} handleOptionsChange={this.handleOptionsChange} newSongAdded={this.state.newSongAdded} setNewSongAddedFalse={this.setNewSongAddedTrue}></GetOptions>
              </div>
            </div>
          </Navbar>
          

          <div id="banner">
            <img id="bg" src="piano.jpg" alt="piano banner"/>
            <p id="slogan">A new way to practice.</p>
            <button id="exploreBtn" onClick={this.scrollToView}>Explore</button>
          </div>

          <div id="jumpHere"></div>


          <div className="row">
            <div className="column" id="col1">
              <h2 id="piecetitle">Title</h2>
              <p>The title of this piece is {this.state.title}</p>
            </div>
            <div className="column" id="col2">
              <h2 id="tips">Some Tips</h2>
              <p>Make sure to count out loud. Take a deep breath before you start. You're going to do great!</p>
            </div>
            <div className="column" id="col3">
              <h2 id="signature">Time Signature</h2>
              <p>The time signature for this piece is {this.state.time_signature}:4</p>
            </div>
          </div>


          <div>
            <SheetMusicDisplay actively_playing={this.state.actively_playing} notes={this.state.notes}></SheetMusicDisplay>
            {/* keyboard */}
            <div className="mt-5" id='piano_container'>
              <SoundfontProvider id = 'mypiano'
                instrumentName="acoustic_grand_piano"
                audioContext={audioContext}
                hostname={soundfontHostname}
                render={({ isLoading, playNote, stopNote }) => (
                  <PianoWithRecording
                    timerStart={this.state.timerStart}
                    recording={this.state.recording}
                    setRecording={this.setRecording}
                    noteRange={noteRange}
                    width={700}
                    playNote={playNote}
                    stopNote={stopNote}
                    disabled={isLoading}
                    timerOn={this.state.timerOn}
                  />
                )}
              />
            </div>
          </div>
        </div>
        <div>
          <Grading timeSignature= {this.state.time_signature} playing={this.state.playing} setActivePlayingFalse={this.setActivePlayingFalse} notes={this.state.notes} grading={this.state.grading} midi_present={this.state.midi_present} events={this.state.recording.events} setPlayingFalse={this.setPlayingFalse} onClickClear={this.onClickClear} executeClearInterval={this.executeClearInterval} handleExit={this.handleExit} handleReturn={this.handleReturn}></Grading>  
        </div>
      </div>);
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
