import './App.css';
import React from 'react';
import { BrowserRouter , Routes, Route } from 'react-router-dom';
import MainPage from './components/mainPage';
import ChatRoom from './components/chatRoom';

function App() {
  return (
    <div class="app">
      <header class="app-header">
      </header>
      <main class="app-main">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage></MainPage>} />
            <Route path="/chatroom" element={<ChatRoom></ChatRoom>} />
          </Routes>
        </BrowserRouter>
      </main>
      <footer>
      </footer>
    </div>
  );
}

export default App;