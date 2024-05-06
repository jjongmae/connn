import './App.css';
import React , { useState } from 'react';
import { BrowserRouter , Routes, Route, useNavigate } from 'react-router-dom';

const CATEGORY = [
  "리그 오브 레전드",
  "배틀 그라운드",
  "메이플 스토리",
  "주식/코인",
  "고민상담",
  "기타"
];

const CHATLIST = [
  {
    category: "리그 오브 레전드", 
    title: "골드4 듀오 구합니다. 저는 정글러 입니다. 1인분 가능하신분.", 
    totalCount: 3, 
    currentCount: 2, 
    user: ["아이언맨", "울버린"], 
    date: "2024.04.03 17:00:00"
  },
  {
    category: "리그 오브 레전드", 
    title: "아이언3 듀오 구합니다. 즐겜 하실분", 
    totalCount: 2, 
    currentCount: 1, 
    user: ["존윅"], 
    date: "2024.04.03 17:10:00"
  },
  {
    category: "리그 오브 레전드", 
    title: "실버1 자랭 구합니다. 빡겜 하실분", 
    totalCount: 5, 
    currentCount: 2, 
    user: ["쉘던", "티모시샬라메"], 
    date: "2024.04.03 17:20:00"
  },
  {
    category: "리그 오브 레전드", 
    title: "일반 게임 하실분", 
    totalCount: 5, 
    currentCount: 1, 
    user: ["백색의간달프"], 
    date: "2024.04.03 17:21:00"
  }
];

const USERS = [
  "쉘던", 
  "티모시샬라메"
];

const Search = () => {
  return (
    <div class="search">
      <input class="input" type="text" placeholder="검색어 입력"/>
    </div>
  );
}

const Category = ({ categories }) => {
  return (
    <div class="category">
      {categories.map((category, index) => (
        <button key={index} class="btn">{category}</button>
      ))}
    </div>
  );
}

const ChatList = ({ chatList }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showButtonIndex, setShowButtonIndex] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
    setShowButtonIndex(index);
  };
  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setShowButtonIndex(null);
  };
  return (
    <div class="chat-list">
      {chatList.map((chat, index) => (
        <div key={index} class="card"
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          style={{ backgroundColor: hoveredIndex === index? 'lightblue' : 'white'}}>
          <div class="title">{chat.title}</div>
          <div class="count">{`${chat.currentCount}/${chat.totalCount}`}</div>
          <div class="user">{chat.user.join(", ")}</div>
          <div class="date">{chat.date}</div>
          {showButtonIndex === index && (
            <button onClick={() => navigate("/chatroom")} class="enter-btn">입장</button>
          )}
        </div>
      ))}
    </div>
  );
}

const FloatingButton = ({setIsModalOpen}) => {
  return (
    <div class="floating-button">
      <button onClick={() => setIsModalOpen(true)}>+</button>
    </div>
  )
}

const CreateChatRoom = ({ setIsModalOpen, categories }) => {
  const [roomInfo, setRoomInfo] = useState({
    category: '',
    title: '',
    totalCount: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoomInfo({
      ...roomInfo,
      [name]: value
    });
  };

  const handleSubmit = () => {
    // 여기서 방 정보를 서버에 보내거나 다른 작업을 수행할 수 있습니다.
    console.log('Room Info:', roomInfo);
    // 팝업 닫기
    setIsModalOpen(false);

    navigate("/chatroom");
  };

  return (
    <div class="modal">
      <div class="modal-content">
        <span class="close" onClick={() => setIsModalOpen(false)}>&times;</span>
        <form onSubmit={handleSubmit}>
          <label>
            카테고리
            <select name="category" value={roomInfo.category} onChange={handleInputChange}>
              <option value="">카테고리를 선택하세요</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <br/>
          <label>
            방제
            <input type="text" name="title" value={roomInfo.title} onChange={handleInputChange} />
          </label>
          <br/>
          <label>
            인원수
            <input type="text" name="totalCount" value={roomInfo.totalCount} onChange={handleInputChange} />
          </label>
          <br/>
          <button type="submit">만들기</button>
        </form>
      </div>
    </div>
  )
}

const MainPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div>
      <Search></Search>
      <Category categories={CATEGORY}></Category>
      <ChatList chatList={CHATLIST}></ChatList>
      <FloatingButton setIsModalOpen={setIsModalOpen}></FloatingButton>
      {isModalOpen && <CreateChatRoom setIsModalOpen={setIsModalOpen} categories={CATEGORY} />}
    </div>
  )
}

const ChatRoom = () => {  
  const users = USERS;

  // 채팅 메시지 목록
  const [messages, setMessages] = useState([]);

  // 입력한 채팅 메시지
  const [newMessage, setNewMessage] = useState('');

  const navigate = useNavigate();

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      setMessages([...messages, { user: 'Me', text: newMessage }]);
      setNewMessage('');
    }
  };

  const handleLeaveRoom = () => {
    // 채팅방 나가기 로직
    navigate("/");
  };

  return (
    <div className="chat-room">
      <div className="user-list">
        <h2>참여자</h2>
        <ul>
          {users.map((user, index) => (
            <div>
              <li key={index}>{user}</li>
              <button>소리</button>
              <button>마이크</button>
              <button>채팅</button>
              <button>강제퇴장</button>
            </div>
          ))}
        </ul>
      </div>
      <div className="chat-area">
        <h2>채팅 내용</h2>
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className="message">
              <strong>{message.user}:</strong> {message.text}
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>전송</button>
        </div>
      </div>
      <div className="leave-button">
        <button onClick={handleLeaveRoom}>채팅방 나가기</button>
      </div>
    </div>
  );
}

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