import React from 'react';
import Button from 'react-bootstrap/Button';
import './Grading.css';
import Vex from 'vexflow';
const VF = Vex.Flow;


export default class Grading extends React.Component {

  handleIntermediateReturn = () => {
    document.getElementById('grading-display').innerHTML = "";
    document.getElementById('grading').hidden = "hidden";
    document.getElementById('button-grade').hidden = "";
    this.props.handleReturn();
  }

  handleGrading = (e) => {

    if(this.props.playing === false) return;

    this.props.setActivePlayingFalse();
    var note_dict = JSON.parse((String(this.props.grading).replace(/'/g,'"').replace(/\.0/g,".0").replace(/\.5/g,".5"))); 
    let correct_notes = []
    var incorrect_notes = []
    var unplayed_notes = []
    var final_note_dict = {}
    var time_subtr;

    if(this.props.midi_present === false) {time_subtr = 5.433}
      else {time_subtr = 5.351}
    
    for (let note of this.props.events) {
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


    this.props.setPlayingFalse();
    this.props.onClickClear();
    this.props.executeClearInterval();

    document.getElementById('correct').innerHTML=correct_notes.length;
    document.getElementById('incorrect').innerHTML=incorrect_notes.length;
    document.getElementById('unplayed').innerHTML=unplayed_notes.length;
    document.getElementById('grading').hidden = "";
    document.getElementById('button-grade').hidden = "hidden";
    this.props.handleExit();
    this.gradingDisplay(final_note_dict)
  };
  
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

    var notes_dict = JSON.parse((String(this.props.notes).replace(/'/g,'"').replace(/\.0/g,".0").replace(/\.5/g,".5")));
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

  render() {
    return (
      <div>
        <div className="grading" id = 'grading' hidden='hidden'>
          <div id='grading-text'>Congratulations! You Played <span id = 'correct'></span> notes <span id = 'correct-label'>correctly</span> and <span id = 'incorrect'></span> notes <span id = 'incorrect-label'>incorrectly</span>. <span id = 'unplayed'></span> notes were <span id = 'unplayed-label'>unplayed</span>. Click <span id="here" onClick={this.handleIntermediateReturn}>here</span> to play again.</div>
          <div id ="grading-display" ></div>
        </div>
        <div id='button-grade'>
          <Button id="gradeBtn" variant="success" onClick={this.handleGrading}>Grade</Button>{' '}
        </div>
      </div>
    )
  }
}
