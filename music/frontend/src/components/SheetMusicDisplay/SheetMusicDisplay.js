import React from 'react';
import Vex from 'vexflow';
const VF = Vex.Flow;

export default class getOptions extends React.Component {

  state = {
    interval: null,
  };
  
  componentDidUpdate(prevProps) {
   if(this.props.actively_playing==true) {
       this.afterSetStateFinished();
   } else {
       this.clearSheetMusic();
   }
  }

  clearSheetMusic = () => {
    document.getElementById('music').innerHTML = "";
  }

  afterSetStateFinished = () => {
    var div = document.getElementById("music")
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    var context = renderer.getContext();
    renderer.resize(10000, 10000);

    var tickContext = new VF.TickContext();

    // Create a stave of width 10000 at position 10, 40 on the canvas.
    var stave = new VF.Stave(10, 10, 10000)
    .addClef('treble');

    var stave2 = new VF.Stave(10, 100, 10000)
    .addClef('bass');

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();
    stave2.setContext(context).draw();
    var notes_dict = JSON.parse((String(this.props.notes).replace(/'/g,'"').replace(/\.0/g,".0").replace(/\.5/g,".5")));
    // ['c', '', 2]
    var end_time = 0
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

    for(var a = 0; a <= end_time; a+= 0.25) {
      var time_str = String(a);

      if(a%1 === 0) {time_str+=".0"} 
        
      if(notes_dict[time_str]) {
        let treb_counter = 0;
        let bass_counter = 0;
        let note1 = notes_dict[time_str];

        for (var n of note1) {
          if(n[0] <= 58) {bass_counter += 1;} 
            else {treb_counter += 1;}
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

      if (acc) {
        note.addAccidental(0, new VF.Accidental(acc));
      }

      tickContext.addTickable(note);

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

      if (acc) {
        note.addAccidental(0, new VF.Accidental(acc));
      }

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

  render() {
    return (
      <div>
        <div id={'exercise-container'}>
            <div id="container">
              <div id="music"></div>
            </div>
        </div>
      </div>
    )
  }
}