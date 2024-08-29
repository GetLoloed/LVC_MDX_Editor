import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import './index.css';
import HomePage from './pages/HomePage.jsx';
import BlocsPage from './pages/BlocsPage.jsx';
import ImagesPage from './pages/ImagesPages.jsx';


function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blocs" element={<BlocsPage />} />
          <Route path="/images" element={<ImagesPage />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
