import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//import Scss
import './assets/scss/themes.scss';

//imoprt Route
import Route from './Routes';

function App() {
  return (
    <React.Fragment>
      <Route />
      <ToastContainer position="top-right" autoClose={3000} />
    </React.Fragment>
  );
}

export default App;
