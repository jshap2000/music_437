import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
//import App from './App';
import MusicUpload from './components/MusicUpload/MusicUpload.js';
import reportWebVitals from './components/reportWebVitals/reportWebVitals.js';

ReactDOM.render(
  <React.StrictMode>
    <MusicUpload />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
