import React , { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CATEGORY from '../mock/category.json';
import CHATLIST from '../mock/chatList.json';

const fetchCategories = async () => {
  const host = process.env.REACT_APP_API_HOST;
  const port = process.env.REACT_APP_API_PORT;
  const url = `${host}:${port}/categories/`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`카테고리를 불러오는데 실패했습니다: ${error}`);
  }
};

const fetchChatList = async () => {
  const host = process.env.REACT_APP_API_HOST;
  const port = process.env.REACT_APP_API_PORT;
  const url = `${host}:${port}/chatRooms/`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`채팅방 목록을 불러오는데 실패했습니다: ${error}`);
  }
};

// 카테고리에 따라 채팅 목록을 가져오는 함수
const fetchChatListByCategory = async (categoryId) => {
  const host = process.env.REACT_APP_API_HOST;
  const port = process.env.REACT_APP_API_PORT;
  const url = `${host}:${port}/chatRooms/category/${categoryId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('채팅 목록을 불러오는데 실패했습니다:', error);
  }
};

const fetchCreateChatRoom = async (roomInfo) => {
  const host = process.env.REACT_APP_API_HOST;
  const port = process.env.REACT_APP_API_PORT;
  const url = `${host}:${port}/chatRooms`;

  try {
    const response = await fetch(url, {
      method: 'POST', // HTTP 메소드를 POST로 변경
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roomInfo) // roomInfo를 JSON 문자열로 변환하여 요청 본문에 포함
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('채팅방을 생성하는데 실패했습니다:', error);
  }
};

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}초 전`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}분 전`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  }
};

const Search = () => {
    return (
      <div className="search">
        <input className="input" type="text" placeholder="검색어 입력"/>
      </div>
    );
  }
  
  const Category = ({ selectedCategory, setSelectedCategory }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
      const init = async () => {
        const data = await fetchCategories();
        setCategories(data);
        setSelectedCategory(data[0]?.categoryId);
      };

      init();
    }, [setSelectedCategory]);

    return (
      <div className="category">
        {categories.map((category) => (
          <button 
            key={category.categoryId} 
            className={`btn ${selectedCategory === category.categoryId ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(category.categoryId)}>
              {category.categoryName}
          </button>
        ))}
      </div>
    );
  }
  
  const ChatList = ({ chatList= [] }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [showButtonIndex, setShowButtonIndex] = useState(null);
    const navigate = useNavigate();
  
    const handleMouseEnter = (roomId) => {
      setHoveredIndex(roomId);
      setShowButtonIndex(roomId);
    };
    const handleMouseLeave = () => {
      setHoveredIndex(null);
      setShowButtonIndex(null);
    };
    const handleOnClickEnterButton = (roomId) => {
      navigate("/chatroom", { state: { roomId } });
    }
    return (
      <div className="chat-list">
        {chatList.map((chat) => (
          <div key={chat.roomId} className="card"
            onMouseEnter={() => handleMouseEnter(chat.roomId)}
            onMouseLeave={handleMouseLeave}>
            <div className="title">{chat.title}</div>
            <div className="count">{`${chat.userCount}/${chat.totalMembers}`}</div>
            <div className="user">{chat.userList ? chat.userList.join(", ") : ""}</div>
            <div className="card-category">{chat.categoryName}</div>
            <div className="date">
              {formatRelativeTime(chat.updatedAt)}
            </div>
            {showButtonIndex === chat.roomId && (
              <button onClick={() => handleOnClickEnterButton(chat.roomId)} className="enter-btn">입장</button>
            )}
          </div>
        ))}
      </div>
    );
  }
  
  const FloatingButton = ({setIsModalOpen}) => {
    return (
      <div className="floating-button">
        <button onClick={() => setIsModalOpen(true)}>+</button>
      </div>
    )
  }
  
  const CreateChatRoom = ({ setIsModalOpen }) => {
    const [categories, setCategories] = useState([]);
    const [roomInfo, setRoomInfo] = useState({
      categoryId: '',
      title: '',
      totalMembers: '',
      name: ''
    });
    const navigate = useNavigate();
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setRoomInfo({
        ...roomInfo,
        [name]: value
      });
    };
  
    const handleSubmit = async () => {
      try {
        const createdRoom = await fetchCreateChatRoom(roomInfo);
        console.log('Room Info:', roomInfo);
        setIsModalOpen(false);
        navigate("/chatroom", { state: { roomId: createdRoom.roomId } });
      } catch (error) {
        console.error('채팅방 생성 중 오류 발생:', error);
      }
    };

    //API 호출을 위한 useEffect
    useEffect(() => {
      const init = async () => {
        const data = await fetchCategories();
        setCategories(data);
      };
  
      init();
    }, []);
  
    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
          <form className="create-chat-room" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>카테고리</label>
                <select name="categoryId" value={roomInfo.categoryId} onChange={handleInputChange}>
                    {categories.map((category) => (
                        <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>제목</label>
                <input type="text" name="title" value={roomInfo.title} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label>인원수</label>
                <input type="text" name="totalMembers" value={roomInfo.totalMembers} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label>닉네임</label>
                <input type="text" name="name" value={roomInfo.name} onChange={handleInputChange} />
            </div>
            <button type="submit">만들기</button>
          </form>
        </div>
      </div>
    )
  }
  
  const MainPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [chatList, setChatList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 카테고리가 변경될 때마다 채팅 목록 갱신
    useEffect(() => {
      const refreshChatList = async () => {
        const data = await fetchChatListByCategory(selectedCategory);
        setChatList(data);
      };
      refreshChatList();
    }, [selectedCategory]);

    useEffect(() => {
      const init = async () => {
        const data = await fetchChatList();
        setChatList(data);
      };

      init();
    }, []);

    return (
      <div>
        <Search />
        <Category selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        <ChatList chatList={chatList} />
        <FloatingButton setIsModalOpen={setIsModalOpen} />
        {isModalOpen && <CreateChatRoom setIsModalOpen={setIsModalOpen} />}
      </div>
    )
  }
  
  export default MainPage;
