import './App.css';
import React , { useState } from 'react';

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
]

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
            <button class="enter-btn">입장</button>
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

function App() {
  return (
    <div class="app">
      <header class="app-header">
      </header>
      <main class="app-main">
        <MainPage></MainPage>
      </main>
      <footer>
      </footer>
    </div>
  );
}

export default App;
