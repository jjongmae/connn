import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './components/mainPage';
import ChatRoom from './components/chatRoom';

function App() {
  return (
    <div className="app">
      <header className="app-header">
      </header>
      <main className="app-main">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/chatroom" element={<ChatRoom />} />
          </Routes>
        </BrowserRouter>
      </main>
      <footer>
      </footer>
    </div>
  );
}

export default App;