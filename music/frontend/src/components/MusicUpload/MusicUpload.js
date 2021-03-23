import React from 'react';
import Select from 'react-select'
import axios from 'axios';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

export default class MusicUpload extends React.Component {
    state = {
      selectOptions: [],
      title: "",
      midi: null
    }
  

  componentWillMount() {
    this.getOptions()
  }

  async getOptions(){
    const res = await axios.get('/playable_pieces');
    const data = res.data.results;

    const options = data.map(d => ({
      "value" : d.title,
      "label" : d.title
    }));
    this.setState({selectOptions: options})
  }

  handleOptionsChange(val){
    this.setState({title: val.value});
  }

  handleMidiChange = (e) => {
    this.setState({
      midi: e.target.files[0]
    })
  };

  handleSubmit = (e) => {
    e.preventDefault();
    let form_data = new FormData();
    form_data.append('midi_file', this.state.midi, this.state.midi.name);
    form_data.append('title', this.state.title);
    form_data.append('user', "josh");
    let url = '/user_pieces/';
    axios.post(url, form_data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
        .then(res => {
          console.log(res.data);
        })
        .catch(err => console.log(err))
  };

  render() {
    return (
      <div>
        <Select options={this.state.selectOptions} onChange={this.handleOptionsChange.bind(this)}/>

        <form onSubmit={this.handleSubmit}>
          <p>
            <input type="file" id="midi" onChange={this.handleMidiChange} required/>
          </p>
          <input type="submit"/>
        </form>

      </div>
      
    )
  }
}
