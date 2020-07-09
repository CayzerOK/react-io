import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Game from './game.js';
import * as serviceWorker from './utils/serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <Game/>
  </React.StrictMode>,
  document.getElementById('root')
);
serviceWorker.unregister();