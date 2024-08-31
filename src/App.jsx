import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';
import { fetchWorkspaces, saveWorkspace } from './store/authSlice';
import Home from './pages/Home';
import BlockManager from './pages/BlockManager';
import ImageManager from './pages/ImageManager';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

function AppContent() {
  const dispatch = useDispatch();
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkspaces()).then((action) => {
      if (action.payload.workspaces.length === 0) {
        dispatch(saveWorkspace({ id: 'default', name: 'Default' }));
      }
    });
  }, [dispatch]);

  const toggleFileExplorer = () => {
    setShowFileExplorer(!showFileExplorer);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <Router>
      <div className="flex flex-col h-screen bg-obsidian-bg text-obsidian-text">
        <Header toggleFileExplorer={toggleFileExplorer} togglePreview={togglePreview} />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  showFileExplorer={showFileExplorer}
                  showPreview={showPreview}
                  togglePreview={togglePreview}
                />
              }
            />
            <Route path="/blocks" element={<BlockManager />} />
            <Route path="/images" element={<ImageManager />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
