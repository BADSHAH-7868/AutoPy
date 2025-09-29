import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ModelSelection from './pages/ModelSelection';
import ChatInterface from './pages/ChatInterface';
import CodeEditor from './pages/CodeEditor';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/select-model" element={<ModelSelection />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/code-editor" element={<CodeEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;