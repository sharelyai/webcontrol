import './config'; // Initialize global store with env vars — must be first
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import FullDemo from './pages/FullDemo.tsx';
import ModesDemo from './pages/ModesDemo.tsx';
import InlineDemo from './pages/InlineDemo.tsx';
import ChatOnly from './pages/ChatOnly.tsx';
import SearchOnly from './pages/SearchOnly.tsx';
import BrowseOnly from './pages/BrowseOnly.tsx';
import CustomShell from './pages/CustomShell.tsx';
import HeadlessDemo from './pages/HeadlessDemo.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/full-demo" element={<FullDemo />} />
        <Route path="/modes-demo" element={<ModesDemo />} />
        <Route path="/inline-demo" element={<InlineDemo />} />
        <Route path="/chat-only" element={<ChatOnly />} />
        <Route path="/search-only" element={<SearchOnly />} />
        <Route path="/browse-only" element={<BrowseOnly />} />
        <Route path="/custom-shell" element={<CustomShell />} />
        <Route path="/headless-demo" element={<HeadlessDemo />} />
      </Routes>
    </Router>
  </React.StrictMode>,
);
