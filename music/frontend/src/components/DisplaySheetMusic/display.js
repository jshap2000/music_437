import React, { Component } from 'react';
import OpenSheetMusicDisplay from './lib/OpenSheetMusicDisplay'

class DisplaySheetMusic extends React.Component {
  constructor(props) {
    super(props);
    // Don't call this.setState() here!
    this.state = { file: "MuzioClementi_SonatinaOpus36No1_Part2.xml" };
  }

  handleClick(event) {
    const file = event.target.value;
    this.setState(state => state.file = file);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Sheet Music Display</h1>
        </header>
        <select onChange={this.handleClick.bind(this)}>
          <option value="MuzioClementi_SonatinaOpus36No1_Part2.xml">Muzio Clementi: Sonatina Opus 36 No1 Part2</option>
          <option value="Beethoven_AnDieFerneGeliebte.xml">Beethoven: An Die FerneGeliebte</option>
        </select>
        <OpenSheetMusicDisplay file={this.state.file} />
      </div>
    );
  }
}

export default DisplaySheetMusic;
