import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div class="app">
      <header class="app-header">
        <div class="search">
          <input class="input" type="text" placeholder="검색어 입력"/>
          <img class="img" src="https://s3.ap-northeast-2.amazonaws.com/cdn.wecode.co.kr/icon/search.png"/>
        </div>
        <div class="category">
          <button class="btn">리그 오브 레전드</button>
          <button class="btn">배틀 그라운드</button>
          <button class="btn">메이플 스토리</button>
          <button class="btn">주식/코인</button>
          <button class="btn">고민상담</button>
          <button class="btn">기타</button>
        </div>
      </header>
      <main class="app-main">
        <div class="chat-list">
          <div class="card">
            <div class="title">골드4 듀오 구합니다. 저는 정글러 입니다. 1인분 가능하신분...</div>
            <div class="count">1/2</div>
            <div class="user">최박사</div>
            <div class="date">2024.04.03 17:00:00</div>
          </div>
        </div>
      </main>
      <footer>
      </footer>
    </div>
  );
}

export default App;
