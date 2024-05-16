import React , { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CATEGORY from '../mock/category.json';
import CHATLIST from '../mock/chatList.json';

const fetchCategories = async () => {
  try {
    //const response = await fetch('API URL');
    //const data = await response.json();
    //// 실제 API 호출 대신 모의 데이터 반환
    const data = CATEGORY;
    return data;
  } catch (error) {
    throw new Error(`카테고리를 불러오는데 실패했습니다: ${error}`);
  }
};

const fetchChatList = async () => {
  try {
    //const response = await fetch('API URL');
    //const data = await response.json();
    const data = CHATLIST;
    return data;
  } catch (error) {
    throw new Error(`채팅방 목록을 불러오는데 실패했습니다: ${error}`);
  }
};

// 카테고리에 따라 채팅 목록을 가져오는 함수
const fetchChatListByCategory = async (categoryId) => {
  try {
    //const response = await fetch(`${process.env.REACT_APP_API_URL}/chatList?category=${categoryId}`);
    const data = CHATLIST;
    return data;
  } catch (error) {
    console.error('채팅 목록을 불러오는데 실패했습니다:', error);
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
      <div className="chat-list">
        {chatList.map((chat) => (
          <div key={chat.chatId} className="card"
            onMouseEnter={() => handleMouseEnter(chat.chatId)}
            onMouseLeave={handleMouseLeave}>
            <div className="title">{chat.title}</div>
            <div className="count">{`${chat.currentCount}/${chat.totalCount}`}</div>
            <div className="user">{chat.userList.join(", ")}</div>
            <div className="card-category">{chat.category}</div>
            <div className="date">{chat.date}</div>
            {showButtonIndex === chat.chatId && (
              <button onClick={() => handleOnClickEnterButton(chat.chatId)} className="enter-btn">입장</button>
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
                <select name="category" value={roomInfo.category} onChange={handleInputChange}>
                    {categories.map((category) => (
                        <option key={category.categoryId} value={category}>{category.categoryName}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>제목</label>
                <input type="text" name="title" value={roomInfo.title} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label>인원수</label>
                <input type="text" name="totalCount" value={roomInfo.totalCount} onChange={handleInputChange} />
            </div>
            <div className="form-group">
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
