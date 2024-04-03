import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="Category-btn-group">
          <button className="Category-btn">리그 오브 레전드</button>
          <button className="Category-btn">배틀 그라운드</button>
          <button className="Category-btn">메이플 스토리</button>
          <button className="Category-btn">주식/코인</button>
          <button className="Category-btn">고민상담</button>
          <button className="Category-btn">기타</button>
        </div>
      </header>
      <main className="App-main">
        <div className="Search">
          <input className="Search-input" type="text" placeholder="검색어 입력"/>
          <img className="Search-img" src="https://s3.ap-northeast-2.amazonaws.com/cdn.wecode.co.kr/icon/search.png"/>
        </div>
      </main>
      <footer>
      </footer>
    </div>
  );
}

export default App;
