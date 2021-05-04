import React from 'react';
import Select from 'react-select'
import axios from 'axios';
import './MusicUpload.css';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

export default class MusicUpload extends React.Component {
    state = {
      title: "",
      midi: null,
      distance: 0
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

  handleSubmit = (e) => {
    e.preventDefault();
    let form_data = new FormData();
    form_data.append('midi_file', this.state.midi, this.state.midi.name);
    form_data.append('title', this.state.title);
    form_data.append('time_per_note', this.state.distance);
    let url = '/playable_pieces/';
    axios.post(url, form_data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
        .then(res => {
          console.log(res.data);
          this.closeForm()
          this.props.options()
        })
        .catch(err => console.log(err))
  };
  

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
            

            <label htmlFor="title"><b>Title</b></label>
            <input type="text" id="title" placeholder="Enter Title" onChange={this.handleTitleChange} required></input>
            
            <label htmlFor="midi_file"><b>Midi File</b></label>
            <input type="file" id="midi" onChange={this.handleMidiChange} required></input>

            <label htmlFor="space_between"><b>Time Between First Notes</b></label>
            <input type="number" step="0.25" placeholder="Enter Time" id="space_between" onChange={this.handleDistanceChange} required></input>

            <button type="submit" className="btn">Save</button>
            <button type="button" className="btn cancel" onClick={this.closeForm}>Close</button>
          </form>
        </div>

      </div>
      
    )
  }
}
