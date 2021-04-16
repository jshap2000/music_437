import Vex from 'vexflow';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import './index.css';
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

const VF = Vex.Flow;

const {
    Accidental,
    Formatter,
    Stave,
    StaveNote,
    Renderer,
    EasyScore,
} = Vex.Flow;

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
    playing: false,
    interval: null,
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
   
  componentWillMount() {
    this.getOptions()
  }

  async getOptions() {
    const res = await axios.get('/playable_pieces');
    const data = res.data.results;
    const options = data.map(d => ({
      "value" : d.title,
      "label" : d.title,
      "notes" : d.notes,
      "grading": d.grading,
    }));
    this.setState({selectOptions: options})
  }

  handleOptionsChange(val){
    this.setState({title: val.value, notes: val.notes, grading: val.grading}, () => {
      document.addEventListener('keypress', (e) => {
        if(this.state.playing==false) {
          this.onClickClear();
          this.afterSetStateFinished();
        }
      });
    });
  }

afterSetStateFinished() {
    this.state.playing=true;
    var div = document.getElementById("music")
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
      
      // var renderer = new Renderer(svgContainer, Renderer.Backends.SVG);
      // Create an SVG renderer and attach it to the DIV element named "boo".

    var context = renderer.getContext();
    renderer.resize(500, 500);

      // A tickContext is required to draw anything that would be placed
      // in relation to time/rhythm, including StaveNote which we use here.
      // In real music, this allows VexFlow to align notes from multiple
      // voices with different rhythms horizontally. Here, it doesn't do much
      // for us, since we'll be animating the horizontal placement of notes, 
      // but we still need to add our notes to a tickContext so that they get
      // an x value and can be rendered.
      //
      

      
      
      
      //var note_dict = JSON.parse((String(this.state.notes).replace(/'/g,'"').replace(/\.0/g,".00").replace(/\.5/g,".50")));
      // If we create a voice, it will automatically apply a tickContext to our
      // notes, and space them relative to each other based on their duration &
      // the space available. We definitely do not want that here! So, instead
      // of creating a voice, we handle that part of the drawing manually.
    var tickContext = new VF.TickContext();

    // Create a stave of width 10000 at position 10, 40 on the canvas.
    var stave = new VF.Stave(10, 10, 10000)
    .addClef('treble');

    var stave2 = new VF.Stave(10, 100, 10000)
    .addClef('bass');

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();
    stave2.setContext(context).draw();

    var durations = [];
    var notes_dict = JSON.parse((String(this.state.notes).replace(/'/g,'"').replace(/\.0/g,".0").replace(/\.5/g,".5")));
    // ['c', '', 2]
    var end_time = 0
    var keys = []
    let notes_treble = [];
    let notes_bass = [];
    for (var key in notes_dict) {
      let note1 = notes_dict[key];
      for (var n of note1) {
        if(n[0]<=58) {
          var appendNote = [n[1].toLowerCase(), n[3].toLowerCase().trim(), n[2]];
          notes_bass.push(appendNote);
        } else {
          var appendNote = [n[1].toLowerCase(), n[3].toLowerCase().trim(), n[2]];
          notes_treble.push(appendNote);
        }
      }
      end_time = parseFloat(key);
    }

    var bass_arr = [];
    var treble_arr= [];
    for(var a = 0; a < end_time; a+=0.25) {
        var time_str = String(a);
        if(a%1==0) {
          time_str+=".0"
        } 
        
      if(notes_dict[time_str]) {
        let treb_counter = 0;
        let bass_counter = 0;
        let note1 = notes_dict[time_str];
        for (var n of note1) {
          if(n[0]<=58) {
            bass_counter+=1;
          } else {
            treb_counter+=1;
          }
        }

        bass_arr.push(bass_counter);
        treble_arr.push(treb_counter);


      } else {
        bass_arr.push(0);
        treble_arr.push(0);

      }

      
    }
    
    
    let notes = notes_treble.map(([letter, acc, octave]) => {
    const note = new VF.StaveNote({
        clef: 'treble',
        keys: [`${letter}${acc}/${octave}`],
        duration: '4',
        })
        .setContext(context)
        .setStave(stave);

    // If a StaveNote has an accidental, we must render it manually.
    // This is so that you get full control over whether to render
    // an accidental depending on the musical context. Here, if we
    // have one, we want to render it. (Theoretically, we might
    // add logic to render a natural sign if we had the same letter
    // name previously with an accidental. Or, perhaps every twelfth
    // note or so we might render a natural sign randomly, just to be
    // sure our user who's learning to read accidentals learns
    // what the natural symbol means.)
    if (acc) note.addAccidental(0, new VF.Accidental(acc));
    tickContext.addTickable(note)
    return note;
    });


    let notes3 = notes_bass.map(([letter, acc, octave]) => {
      const note = new VF.StaveNote({
          clef: 'bass',
          keys: [`${letter}${acc}/${octave}`],
          duration: '4',
          })
          .setContext(context)
          .setStave(stave2);

      // If a StaveNote has an accidental, we must render it manually.
      // This is so that you get full control over whether to render
      // an accidental depending on the musical context. Here, if we
      // have one, we want to render it. (Theoretically, we might
      // add logic to render a natural sign if we had the same letter
      // name previously with an accidental. Or, perhaps every twelfth
      // note or so we might render a natural sign randomly, just to be
      // sure our user who's learning to read accidentals learns
      // what the natural symbol means.)
      if (acc) note.addAccidental(0, new VF.Accidental(acc));
      tickContext.addTickable(note);
      return note;
    });


    // The tickContext.preFormat() call assigns x-values (and other
    // formatting values) to notes. It must be called after we've 
    // created the notes and added them to the tickContext. Or, it
    // can be called each time a note is added, if the number of 
    // notes needed is not known at the time of bootstrapping.
    //
    // To see what happens if you put it in the wrong place, try moving
    // this line up to where the TickContext is initialized, and check
    // out the error message you get.
    //
    // tickContext.setX() establishes the left-most x position for all
    // of the 'tickables' (notes, etc...) in a context.
    tickContext.preFormat().setX(400);
    //context.preFormat().setX(400);
    // This will contain any notes that are currently visible on the staff,
    // before they've either been answered correctly, or plumetted off
    // the staff when a user fails to answer them correctly in time.
    // TODO: Add sound effects.
    const visibleNoteGroups = [];
    // Add a note to the staff from the notes array (if there are any left).
    var counter = 0;
    
    this.state.interval = setInterval(() => {
      
      
      for(var i = 0; i < treble_arr[counter]; i++) {
          var note = notes.shift();
          if (!note) return;
          
          const group = context.openGroup();
          visibleNoteGroups.push(group);
          note.draw();
      
      context.closeGroup();
      group.classList.add('scroll');
      // Force a dom-refresh by asking for the group's bounding box. Why? Most
      // modern browsers are smart enough to realize that adding .scroll class
      // hasn't changed anything about the rendering, so they wait to apply it
      // at the next dom refresh, when they can apply any other changes at the
      // same time for optimization. However, if we allow that to happen,
      // then sometimes the note will immediately jump to its fully transformed
      // position -- because the transform will be applied before the class with
      // its transition rule. 
      const box = group.getBoundingClientRect();
      group.classList.add('scrolling');

      // If a user doesn't answer in time make the note fall below the staff
      window.setTimeout(() => {
          //const index = visibleNoteGroups.indexOf(group);
          // if (index === -1) return;
          group.classList.add('too-slow');
          // visibleNoteGroups.shift();
      }, 5000); }

      for(var i = 0; i < bass_arr[counter]; i++) {
        var note = notes3.shift();
        if (!note) return;
        
        const group = context.openGroup();
        visibleNoteGroups.push(group);
        note.draw();
    
    context.closeGroup();
    group.classList.add('scroll');
    // Force a dom-refresh by asking for the group's bounding box. Why? Most
    // modern browsers are smart enough to realize that adding .scroll class
    // hasn't changed anything about the rendering, so they wait to apply it
    // at the next dom refresh, when they can apply any other changes at the
    // same time for optimization. However, if we allow that to happen,
    // then sometimes the note will immediately jump to its fully transformed
    // position -- because the transform will be applied before the class with
    // its transition rule. 
    const box = group.getBoundingClientRect();
    group.classList.add('scrolling');

    // If a user doesn't answer in time make the note fall below the staff
    window.setTimeout(() => {
        //const index = visibleNoteGroups.indexOf(group);
        // if (index === -1) return;
        group.classList.add('too-slow');
        // visibleNoteGroups.shift();
    }, 5000); }

    counter+=1;

      }, 250);  

  }

  handleGrading = (e) => {
    var note_dict = JSON.parse((String(this.state.grading).replace(/'/g,'"').replace(/\.0/g,".0").replace(/\.5/g,".5"))); 
    let correct_notes = []
    var incorrect_notes = []
    var unplayed_notes = []
    for (let note of this.state.recording.events) {
      let timestamp = (Math.round((note.time-5.309) * 4) / 4).toFixed(2);
      if(timestamp<-4) {}
      else if(note_dict[timestamp] && note_dict[timestamp].indexOf(note.midiNumber)!=-1) {
        var index = 0;
        note_dict[timestamp].splice(note_dict[timestamp].indexOf(note.midiNumber), 1)//note_dict[timestamp].remove(note.midiNumber);
        correct_notes.push({time: timestamp, midiNumber: note.midiNumber})
      } else {
        incorrect_notes.push({time: timestamp, midiNumber: note.midiNumber})
      }
    }

    for (let time in note_dict) {
      for (let note of note_dict[time]) {
        unplayed_notes.push({time: time, midiNumber: note})
      }
    }

    document.getElementById('correct').innerHTML=correct_notes.length;
    document.getElementById('incorrect').innerHTML=incorrect_notes.length;
    document.getElementById('unplayed').innerHTML=unplayed_notes.length;
    
    this.onClickClear();
    clearInterval(this.state.interval);
    document.getElementById('music').innerHTML ="";
    this.state.playing = false;
  
  };

  render() {
    
    // And get a drawing context:
    

    return (
      
      <div id="page">

        {/* header */}
        <h1 className="header" >Piano Trainer Beta</h1>

        {/* song slection   */}
        <div>
          <Select options={this.state.selectOptions} onChange={this.handleOptionsChange.bind(this)}/>
        </div>
        
        {/* recording notes for development 
        <div className="mt-5">
          <div>{JSON.stringify(this.state.recording.events)}</div>
        </div> */}
        
        {/* sheet music render */}
        {/* <div id="container">
          <div id="music"></div>
        </div> */}
                
        <div>
          <div id={'exercise-container'}>
          <div id="container">
                <div id="music"></div>
                </div>
                <div id="controls">
          </div>
          </div>
        </div>
          
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
                keyboardShortcuts={keyboardShortcuts}
                timerOn={this.state.timerOn}
              />
            )}
          />
        </div>


        {/* display grade */}
        <div id = 'grading'>
          Correct: <div id = 'correct'></div>
          Incorrect: <div id = 'incorrect'></div>
          Unplayed: <div id = 'unplayed'></div>
        </div>

        {/* grade button  */}
        <button onClick={this.handleGrading}>Grade</button>

      </div>
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);