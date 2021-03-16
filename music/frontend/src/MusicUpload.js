import React from 'react';

import axios from 'axios';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

export default class MusicUpload extends React.Component {
  state = {
    pieces: []
  }

  componentDidMount() {
    axios.get('/pieces')
      .then(res => {
        console.log(res);
        this.state.pieces = res.data;
        console.log(this.state.pieces);
      })
  }

  render() {
    console.log(this.state.pieces);
    return (
      
      <ul>
        <h1>Hello</h1>
        { this.state.pieces.map(piece => <li>{piece.title}</li>)}
      </ul>
    )
  }
}
