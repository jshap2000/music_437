import React from 'react';
import axios from 'axios';
import Select from 'react-select';
import './GetOptions.css';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;


export default class getOptions extends React.Component {
  
  componentWillMount() {
    this.getOptions()
  }
  
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
        <Select id="options" options={this.props.options} onChange={this.props.handleOptionsChange}/>
      </div>
    )
  }
}