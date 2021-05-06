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
    time_signature: "",
    preset:false,
    playing: false,
    actively_playing: false,
    interval: null,
    midi_present: false,
    isUploadFormActive: false,
    uploadTitle: "",
    uploadFile: ""
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

  handleReturn = () => {
    document.getElementById('grading-display').innerHTML = "";
    document.getElementById('playing-display').hidden = "";
    document.getElementById('grading').hidden = "hidden";
    document.getElementById('options').hidden = "";
    this.setState({playing:true});
  }

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

  handleShowUploadForm = () => {
    this.setState(({ isUploadFormActive }) => (
      { isUploadFormActive: !isUploadFormActive }));
  }

  handleGrading = (e) => {

    if(this.state.playing === false) return;

    this.setState({actively_playing: false});
    var note_dict = JSON.parse((String(this.state.grading).replace(/'/g,'"').replace(/\.0/g,".0").replace(/\.5/g,".5"))); 
    let correct_notes = []
    var incorrect_notes = []
    var unplayed_notes = []
    var final_note_dict = {}
    var time_subtr;

    if(this.state.midi_present === false) {time_subtr = 5.433}
      else {time_subtr = 5.351}
    
    for (let note of this.state.recording.events) {
      let timestamp = (Math.round((note.time-time_subtr) * 4) / 4).toFixed(2);

      if(timestamp<-4) {}
      else if(note_dict[timestamp] && note_dict[timestamp].indexOf(note.midiNumber) !== -1) {
        note_dict[timestamp].splice(note_dict[timestamp].indexOf(note.midiNumber), 1)//note_dict[timestamp].remove(note.midiNumber);
        correct_notes.push({time: parseFloat(timestamp), midiNumber: note.midiNumber, status: "correct"})

        if(final_note_dict[timestamp]) {
          final_note_dict[timestamp].push({time: parseFloat(timestamp), midiNumber: note.midiNumber, status: "correct"})
        } else {
          final_note_dict[timestamp] = [{time: parseFloat(timestamp), midiNumber: note.midiNumber, status: "correct"}]
        }
      } else {
        incorrect_notes.push({time: parseFloat(timestamp), midiNumber: note.midiNumber, status: "incorrect"})
        if(final_note_dict[timestamp]) {
          final_note_dict[timestamp].push({time: parseFloat(timestamp), midiNumber: note.midiNumber, status: "incorrect"})
        } else {
          final_note_dict[timestamp] = [{time: parseFloat(timestamp), midiNumber: note.midiNumber, status: "incorrect"}]
        }
      }
    }

    for (let time in note_dict) {
      for (let note of note_dict[time]) {
        unplayed_notes.push({time: parseFloat(time), midiNumber: note, status: "unplayed"})
        if(final_note_dict[time]) {
          final_note_dict[time].push({time: parseFloat(time), midiNumber: note, status: "unplayed"})
        } else {
          final_note_dict[time] = [{time: parseFloat(time), midiNumber: note, status: "unplayed"}]
        }
      }
    }

    document.getElementById('correct').innerHTML=correct_notes.length;
    document.getElementById('incorrect').innerHTML=incorrect_notes.length;
    document.getElementById('unplayed').innerHTML=unplayed_notes.length;

    this.state.playing=false;
    this.onClickClear();
    clearInterval(this.state.interval);

    document.getElementById('music').innerHTML ="";
    document.getElementById('playing-display').hidden = "hidden";
    document.getElementById('options').hidden = "hidden";
    document.getElementById('grading').hidden = "";

    this.gradingDisplay(final_note_dict)
  };



  scrollToView() {
    console.log("hereeeee");
    document.getElementById("jumpHere").scrollIntoView({behavior: 'smooth'});
  }


  getOctave() {
    var notes = "C C#D D#E F F#G G#A A#B ";
    var octv;
    var nt;
    var dict = {}
    for (var noteNum = 21; noteNum < 108; noteNum++) {
      octv = noteNum / 12 - 1;
      nt = notes.substring((noteNum % 12) * 2, (noteNum % 12) * 2 + 2);
      dict[noteNum] = {octave: Math.trunc(octv), note: nt, together: nt[0].toLowerCase() + nt[1].replace(/ /g,'') + "/" + Math.trunc(octv).toString(), sharp: nt[1].replace(/ /g,'')}
    }
    return dict;
  }

  gradingDisplay(final_note_dict) {

    var notes_dict = JSON.parse((String(this.state.notes).replace(/'/g,'"').replace(/\.0/g,".0").replace(/\.5/g,".5")));
    // ['c', '', 2]
    var end_time = 0
    var keys = []
    let notes_treble = [];
    let notes_bass = [];

    for (var key in notes_dict) {
      let note1 = notes_dict[key];

      for (var n of note1) {
        if(n[0] <= 58) {
          var appendNote = [n[1].toLowerCase(), n[3].toLowerCase().trim(), n[2]];
          notes_bass.push(appendNote);
        } else {
          var appendNote = [n[1].toLowerCase(), n[3].toLowerCase().trim(), n[2]];
          notes_treble.push(appendNote);
        }
      }

      end_time = Math.ceil(parseFloat(key)/4)*4
    }

    var octaves = this.getOctave()
    
    var div = document.getElementById("grading-display")
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
      
    var context = renderer.getContext();
    renderer.resize(1700, Math.ceil(80*end_time/4));

    var i = 0;
    var a = 0;
    var b = -200;
    var c = 0;
    var d = -100;

    while(i < end_time) {

      if(i % 16 === 0) {
        b += 250;
        d += 250;
        a = 0;
        c = 0;
      }

    if(a === 0) {
      var stave = new VF.Stave(a, b, 400).addClef('treble');
    } else {
      var stave = new VF.Stave(a, b, 400);
    }

    if(c === 0) {
      var stave2 = new VF.Stave(c, d, 400).addClef('bass');
    } else {
      var stave2 = new VF.Stave(c, d, 400)
    }
    
    a += 400;
    c += 400;
    
    var notes = []
    var t = i;

    while(t<i+4) {
      var time_str = t.toString();
      if(t % 1 === 0) {time_str+=".00"}

      if(t % 1 === 0.5) {time_str+="0"}

      if(final_note_dict[time_str]) {
        var keys = [];
        var status_arr = []
        var sharp_arr = []
        let arr = final_note_dict[time_str];
        
        var min_midi_number;
        var whole_note;
        var midi_counter;

        var remainders = []

        while(arr.length > 0) {

          if(arr[0]['midiNumber']<60) {
            remainders.push(arr[0])
            arr.splice(0, 1)
          } else {

          min_midi_number= arr[0]['midiNumber'];
          whole_note = arr[0];
          midi_counter= 0;
          var dl = 0;

          for(let note of arr) {
            if(note['midiNumber']< min_midi_number && note['midiNumber']>= 60) {
              min_midi_number = note['midiNumber']
              whole_note = note
              midi_counter = dl;
            }

            dl++;
          }

          arr.splice(midi_counter, 1)
          keys.push(octaves[whole_note['midiNumber']]['together'])
          status_arr.push(whole_note['status'])
          sharp_arr.push(octaves[whole_note['midiNumber']]['sharp'])
        }
        }
        
        if(keys.length>0) {
          notes.push([{ keys: keys, duration: "16" }, status_arr, sharp_arr]);
        } else {
          notes.push([{keys:["r/16"], duration: "16r" }, 'rest']);
        }

        final_note_dict[time_str] = remainders;
      } else {
        notes.push([{keys:["r/16"], duration: "16r" }, 'rest']);
      }

      t+=.25;
    }

    var stave_notes = []

    for(let note of notes) {
      /* treble clef notes */ 
        var stave_note = new VF.StaveNote(note[0]);

        if(note[1] !== 'rest') {
          var counting = 0

          for(let status of note[1]) {
            if(status === 'unplayed') {
              stave_note.setKeyStyle(counting, { fillStyle: 'tomato', strokeStyle: 'tomato' });
            } else if(status === 'correct') {
              stave_note.setKeyStyle(counting, { fillStyle: 'green', strokeStyle: 'green' });
            } else if(status === 'incorrect') {
              stave_note.setKeyStyle(counting, { fillStyle: 'red', strokeStyle: 'red' });
            }
            counting++;
          }

          counting = 0

          for(let sharp of note[2]) {
            if(sharp === "#") {
              stave_note.addAccidental(counting, new VF.Accidental("#"))
            }
            counting++;
          }
        }

        stave_notes.push(stave_note);
    }
    
    VF.Formatter.FormatAndDraw(context, stave, stave_notes, false);

    stave.setContext(context).draw();

    /* base clef notes */ 

    notes = [];
    t = i;

    while(t < i+4) {

      var time_str = t.toString();

      if(t%1 === 0) {
        time_str+=".00"
      }

      if(t%1 === 0.5) {
        time_str+="0"
      }

      if(final_note_dict[time_str]) {
        var keys = [];
        var status_arr = []
        var sharp_arr = []
        let arr = final_note_dict[time_str];
        
        var min_midi_number;
        var whole_note;
        var midi_counter;

        while(arr.length > 0) {

          if(arr[0]['midiNumber'] >= 60) {
            arr.splice(0, 1)
          } else {
            // console.log('arrived')
            min_midi_number= arr[0]['midiNumber'];
            whole_note = arr[0];
            midi_counter= 0;
            var dl = 0;

          for(let note of arr) {

            if(note['midiNumber'] < min_midi_number && note['midiNumber'] < 0) {

              min_midi_number = note['midiNumber']
              whole_note = note
              midi_counter = dl;
            }

            dl++;
          }

          arr.splice(midi_counter, 1)
          keys.push(octaves[whole_note['midiNumber']]['together'])
          status_arr.push(whole_note['status'])
          sharp_arr.push(octaves[whole_note['midiNumber']]['sharp'])
          }
        }

        if(keys.length > 0) {
          notes.push([{clef: "bass", keys: keys, duration: "16" }, status_arr, sharp_arr])
        } else {
          notes.push([{clef: "bass", keys:["r/16"], duration: "16r" }, 'rest']);
        }


      } else {
        notes.push([{clef: "bass", keys:["r/16"], duration: "16r" }, 'rest']);
      }
      t += .25;
    }

    stave_notes = []

    for(let note of notes) {
        var stave_note = new VF.StaveNote(note[0]);
        if(note[1] !== 'rest') {
          var counting = 0

          for(let status of note[1]) {
            
            if(status === 'unplayed') {
              stave_note.setKeyStyle(counting, { fillStyle: 'tomato', strokeStyle: 'tomato' });
            } else if(status === 'correct') {
              stave_note.setKeyStyle(counting, { fillStyle: 'green', strokeStyle: 'green' });
            } else if(status === 'incorrect') {
              stave_note.setKeyStyle(counting, { fillStyle: 'red', strokeStyle: 'red' });
            }

            counting++;
          }

          counting = 0

          for(let sharp of note[2]) {
            if(sharp === "#") {
              stave_note.addAccidental(counting, new VF.Accidental("#"))
            }
            
            counting++; 
          }
        }
        
        stave_notes.push(stave_note);
    }

    VF.Formatter.FormatAndDraw(context, stave2, stave_notes, false);

    stave2.setContext(context).draw();
    i = t;
    }
  }

  setWeb = () => {
    this.setState({midi_present: false});
  }

  setMidi = () =>  {
    this.setState({midi_present: true});
  }

  render() {

    // And get a drawing context:


    return (
      <div id="page">
        <Navbar id="navbar" bg="light" variant="light">
          <img id="icon1" src="MusicNote.png" alt="note icon"/>
          <Navbar.Brand >Piano Practice</Navbar.Brand>
          <Nav className="mr-auto">
            <img id="icon2" src="webkeyboard.png" alt="midi icon"/>
            <Nav.Link onClick={this.setWeb}>Web Keyboard</Nav.Link>
            <img id="icon3" src="midikeyboard.png" alt="webkey icon"/>
            <Nav.Link onClick={this.setMidi}>Midi Keyboard</Nav.Link>
            
           
          </Nav>
          <div id="op">
          <img id="icon4" src="search.png" alt="search icon"/>
          <div id='options'>
            <GetOptions options={this.state.selectOptions} setOptionsStart={this.setOptionsStart} handleOptionsChange={this.handleOptionsChange}></GetOptions>
          </div></div>
        </Navbar>

        <div id="banner">
          <img id="bg" src="piano.jpg" alt="piano banner"/>
          <p id="slogan">A new way to practice.</p>
          <button id="exploreBtn" onClick={this.scrollToView}>Explore</button>
        </div>

        <div id="jumpHere"></div>

        <div className="grading" id = 'grading' hidden='hidden'>
          <div id='grading-text'>Congragulations! You Played <span id = 'correct'></span> notes <span id = 'correct-label'>correctly</span> and <span id = 'incorrect'></span> notes <span id = 'incorrect-label'>incorrectly</span>. <span id = 'unplayed'></span> notes were <span id = 'unplayed-label'>unplayed</span>. Click <span id="here" onClick={this.handleReturn}>here</span> to play again.</div>
          <div id ="grading-display" ></div>
        </div>

        <div class="row">
          <div class="column" id="col1">
            <h2 id="artist">Artist</h2>
            <p>The artist for this piece is Joni Mitchell.</p>
          </div>
          <div class="column" id="col2">
            <h2 id="tips">Some Tips</h2>
            <p>Make sure to count out loud. Take a deep breath before you start. You're going to do great!</p>
          </div>
          <div class="column" id="col3">
            <h2 id="signature">Time Signature</h2>
            <p>The time signature for this piece is 4:4.</p>
          </div>
        </div>

        <div id = "playing-display" className="playing"></div>

        <div>
        <SheetMusicDisplay actively_playing={this.state.actively_playing} notes={this.state.notes}></SheetMusicDisplay>

              {/* keyboard */}
              <div className="mt-5" id='piano_container'>
                <SoundfontProvider
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
              <div id='button-grade'>
                <Button id="gradeBtn" variant="success" onClick={this.handleGrading}>Grade</Button>{' '}
              </div>
        </div>

      </div>);
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
