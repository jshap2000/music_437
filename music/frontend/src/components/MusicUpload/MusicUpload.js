import React from 'react';
import axios from 'axios';
import './MusicUpload.css';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

export default class MusicUpload extends React.Component {
    state = {
      title: "",
      midi: null,
      distance: 0,
      time_signature: 4,
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
          this.closeForm();
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
  

  openForm = () => {
    document.getElementById("myForm").style.display = "block";
  }
  
  closeForm = () => {
    document.getElementById("myForm").style.display = "none";
  }

  render() {
    return (
      <div>
        <div className="open-button" onClick={this.openForm} >Upload Midi</div>

        <div className="form-popup" id="myForm">
          <form action="" className="form-container" onSubmit={this.handleSubmit}>
            
            <div>
              <label htmlFor="title"><b>Title</b></label>
              <input type="text" id="title" placeholder="Enter Title" onChange={this.handleTitleChange} required></input>
            </div>
            <div className = "formable">
              <label htmlFor="midi_file"><b>Midi File</b></label>
              <input type="file" id="midi" onChange={this.handleMidiChange} required></input>
            </div>
            <div className = "formable">
              <label htmlFor="space_between"><b>Time Between First Notes</b></label>
              <input type="number" step="0.25" placeholder="Enter Time" id="space_between" onChange={this.handleDistanceChange} required/>
            </div>
            <div className = "formable">
              <label htmlFor="time_signature"><b>Time Signature</b></label>
              <input type="number" placeholder="Enter Time Signature" id="time_signature" onChange={this.handleSignatureChange} required/>
            </div>

            <button type="submit" className="btn">Save</button>
            <button type="button" className="btn cancel" onClick={this.closeForm}>Close</button>

          </form>
        </div>

      </div>
    )
  }
}
