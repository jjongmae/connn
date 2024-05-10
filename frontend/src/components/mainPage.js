import React , { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CATEGORY from '../mock/category.json';
import CHATLIST from '../mock/chatList.json';

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
    const handleOnClickEnterButton = (index) => {
      navigate("/chatroom");
    }
    return (
      <div class="chat-list">
        {chatList.map((chat, index) => (
          <div key={index} class="card"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}>
            <div class="title">{chat.title}</div>
            <div class="count">{`${chat.currentCount}/${chat.totalCount}`}</div>
            <div class="user">{chat.user.join(", ")}</div>
            <div class="date">{chat.date}</div>
            {showButtonIndex === index && (
              <button onClick={() => handleOnClickEnterButton(index)} class="enter-btn">입장</button>
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
      totalCount: '',
      nickName: ''
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
      // 채팅방 화면으로 이동
      navigate("/chatroom");
    };
  
    return (
      <div class="modal">
        <div class="modal-content">
          <span class="close" onClick={() => setIsModalOpen(false)}>&times;</span>
          <form class="create-chat-room" onSubmit={handleSubmit}>
            <div class="form-group">
                <label>카테고리</label>
                <select name="category" value={roomInfo.category} onChange={handleInputChange}>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>
            </div>
            <div class="form-group">
                <label>제목</label>
                <input type="text" name="title" value={roomInfo.title} onChange={handleInputChange} />
            </div>
            <div class="form-group">
                <label>인원수</label>
                <input type="text" name="totalCount" value={roomInfo.totalCount} onChange={handleInputChange} />
            </div>
            <div class="form-group">
                <label>닉네임</label>
                <input type="text" name="nickName" value={roomInfo.nickName} onChange={handleInputChange} />
            </div>
            <button type="submit">만들기</button>
          </form>
        </div>
      </div>
    )
  }
  
  const MainPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [chatList, setChatList] = useState([]);

    const requestCategories = async () => {
      try {
        //const response = await fetch('API URL');
        //const data = await response.json();
        const data = CATEGORY;
        setCategories(data);
      } catch (error) {
        console.error(`카테고리를 불러오는데 실패했습니다.\ncode: ${error}`);
      }
    };

    const requestChatList = async () => {
      try {
        //const response = await fetch('API URL');
        //const data = await response.json();
        const data = CHATLIST;
        setChatList(data);
      } catch (error) {
        console.error(`채팅방 목록을 불러오는데 실패했습니다.\ncode: ${error}`);
      }
    };

    //API 호출을 위한 useEffect
    useEffect(() => {
      requestCategories();
      requestChatList();
    }, []);
    
    return (
      <div>
        <Search></Search>
        <Category categories={categories}></Category>
        <ChatList chatList={chatList}></ChatList>
        <FloatingButton setIsModalOpen={setIsModalOpen}></FloatingButton>
        {isModalOpen && <CreateChatRoom setIsModalOpen={setIsModalOpen} categories={categories} />}
      </div>
    )
  }

  export default MainPage;