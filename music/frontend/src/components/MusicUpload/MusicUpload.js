import React from 'react';
import axios from 'axios';
import './MusicUpload.css';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

export default class MusicUpload extends React.Component {
  constructor(props) {
    super(props);
   }

    state = {
      title: "",
      midi: null,
      distance: 0,
      time_signature: 4
    }
  
  handleMidiChange = (e) => {
    this.setState({
      midi: e.target.files[0]
    })
  };

  handleTitleChange = (e) => {
    this.setState({
      title: e.target.value
    })
  };

  handleDistanceChange = (e) => {
    this.setState({
      distance: e.target.value
    })
  };

  handleSignatureChange = (e) => {
    this.setState({
      time_signature: e.target.value
    })
  };

  handleSubmit = (e) => {
    e.preventDefault();
    let form_data = new FormData();
    form_data.append('midi_file', this.state.midi, this.state.midi.name);
    form_data.append('title', this.state.title);
    form_data.append('time_per_note', this.state.distance);
    form_data.append('time_signature', this.state.time_signature);
    let url = '/playable_pieces/';
    axios.post(url, form_data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
        .then(res => {
          console.log(res.data);
          this.props.handleShowUploadForm();
          // this.props.options()
          this.getOptions();
        })
        .catch(err => console.log(err))
  };

  getOptions = async() => {
    const res = await axios.get('/playable_pieces');
    const data = res.data.results;
    const options = data.map(d => ({
      "value" : d.title,
      "label" : d.title,
      "notes" : d.notes,
      "grading": d.grading,
      "time_signature": d.time_signature,
    }));
    this.props.setOptionsStart(options);
   }

  render() {
    return (
      <div>
        <div className="form-popup" id="myForm">
          <form action="" className="form-container" onSubmit={this.handleSubmit}>
            
            <label htmlFor="title"><b>Title</b></label>
            <input type="text" id="title" placeholder="Enter Title" onChange={this.handleTitleChange} required></input>
            
            <label htmlFor="midi_file"><b>Midi File</b></label>
            <input type="file" id="midi" onChange={this.handleMidiChange} required></input>

            <label htmlFor="space_between"><b>Time Between First Notes</b></label>
            <input type="number" step="0.25" placeholder="Enter Time" id="space_between" onChange={this.handleDistanceChange} required/>

            <button type="submit" className="btn">Save</button>

            <button type="button" className="btn cancel" onClick={this.props.handleShowUploadForm}>Close</button>
          </form>
        </div>
      </div>
    )
  }
}
