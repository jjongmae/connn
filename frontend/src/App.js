import './App.css';
import React from 'react';

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
    user: ["최박사", "김박사"], 
    date: "2024.04.03 17:00:00"
  },
  {
    category: "리그 오브 레전드", 
    title: "아이언3 듀오 구합니다. 즐겜 하실분", 
    totalCount: 2, 
    currentCount: 1, 
    user: ["즐겜러"], 
    date: "2024.04.03 17:10:00"
  },
  {
    category: "리그 오브 레전드", 
    title: "실버1 자랭 구합니다. 빡겜 하실분", 
    totalCount: 5, 
    currentCount: 2, 
    user: ["빡겜러", "트롤러"], 
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

class Search extends React.Component {
  render(){
    return (
      <div class="search">
        <input class="input" type="text" placeholder="검색어 입력"/>
      </div>
    );
  }
}

class Category extends React.Component {
  render(){
    const { categories } = this.props;
    return (
      <div class="category">
        {categories.map((category, index) => (
          <button key={index} class="btn">{category}</button>
        ))}
      </div>
    );
  }
}

class ChatList extends React.Component {
  render(){
    const { chatList } = this.props;
    return (
      <div class="chat-list">
        {chatList.map((chat, index) => (
          <div key={index} class="card">
            <div class="title">{chat.title}</div>
            <div class="count">{`${chat.currentCount}/${chat.totalCount}`}</div>
            <div class="user">{chat.user.join(", ")}</div>
            <div class="date">{chat.date}</div>
          </div>
        ))}
      </div>
    );
  }
}

function App() {
  return (
    <div class="app">
      <header class="app-header">
      </header>
      <main class="app-main">
        <Search></Search>
        <Category categories={CATEGORY}></Category>
        <ChatList chatList={CHATLIST}></ChatList>
      </main>
      <footer>
      </footer>
    </div>
  );
}

export default App;
