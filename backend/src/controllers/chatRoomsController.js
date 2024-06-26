const db = require('../database/db');
const { getRoomUsers } = require('../socket');

exports.getAllChatRooms = async (req, res) => {
    try {
        const [chatRooms, ] = await db.query(`
            SELECT chat_rooms.*, categories.category_name
            FROM chat_rooms 
            JOIN categories ON chat_rooms.category_id = categories.category_id
        `);
        for (let room of chatRooms) {
            const userList = getRoomUsers(room.room_id);
            console.log(`userList: ${JSON.stringify(userList)}`);
            room.user_list = userList;
            room.user_count = userList.length;
        }
        res.json(chatRooms);
    } catch (err) {
        console.error(`getAllChatRooms 에러: ${err.message}`); // 에러 로그 한글로 기록
        res.status(500).json({ message: err.message });
    }
};

exports.createChatRoom = async (req, res) => {
    const { categoryId, title, totalMembers } = req.body;
    try {
        // 채팅방 생성
        const [roomResult] = await db.query(`INSERT INTO chat_rooms (category_id, title, total_members, status) VALUES (?, ?, ?, 'active')`, [categoryId, title, totalMembers]);
        const roomId = roomResult.insertId;

        res.status(201).json({ message: '채팅방이 생성되었습니다', room_id: roomId });
    } catch (err) {
        console.error(`createChatRoom 에러: ${err.message}`); // 에러 로그 한글로 기록
        res.status(500).json({ message: err.message });
    }
};

exports.getChatRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const [results, ] = await db.query(`
            SELECT chat_rooms.*, categories.name AS category_name
            FROM chat_rooms
            JOIN categories ON chat_rooms.category_id = categories.category_id
            WHERE chat_rooms.room_id = ?
        `, [id]);

        if (results.length > 0) {
            const room = results[0];
            const userList = getRoomUsers(room.room_id);
            room.user_list = userList;
            room.user_count = userList.length;
            res.json(room);
        } else {
            res.status(404).json({ message: '채팅방을 찾을 수 없습니다' });
        }
    } catch (err) {
        console.error(`getChatRoom 에러: ${err.message}`); // 에러 로그 한글로 기록
        res.status(500).json({ message: err.message });
    }
};

exports.updateChatRoom = async (req, res) => {
    const { id } = req.params;
    const { categoryId, title, totalMembers, status } = req.body;
    try {
        const [result, ] = await db.query('UPDATE chat_rooms SET category_id = ?, title = ?, total_members = ?, status = ? WHERE room_id = ?', [categoryId, title, totalMembers, status, id]);
        if (result.affectedRows > 0) {
            res.json({ message: '채팅방이 업데이트되었습니다' });
        } else {
            res.status(404).json({ message: '채팅방을 찾을 수 없습니다' });
        }
    } catch (err) {
        console.error(`updateChatRoom 에러: ${err.message}`); // 에러 로그 한글로 기록
        res.status(500).json({ message: err.message });
    }
};

exports.deleteChatRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const [result, ] = await db.query('DELETE FROM chat_rooms WHERE room_id = ?', [id]);
        if (result.affectedRows > 0) {
            res.json({ message: '채팅방이 삭제되었습니다' });
        } else {
            res.status(404).json({ message: '채팅방을 찾을 수 없습니다' });
        }
    } catch (err) {
        console.error(`deleteChatRoom 에러: ${err.message}`); // 에러 로그 한글로 기록
        res.status(500).json({ message: err.message });
    }
};

exports.searchChatRoom = async (req, res) => {
    const { categoryId, searchQuery } = req.body; // req.params에서 req.body로 변경
    console.log(`searchChatRoom categoryId: ${categoryId}, searchQuery: ${searchQuery}`);
    try {
        let query = `
            SELECT chat_rooms.*, categories.category_name
            FROM chat_rooms
            JOIN categories ON chat_rooms.category_id = categories.category_id
            WHERE 1=1
        `;
        let queryParams = [];

        if (categoryId && !isNaN(categoryId)) { // categoryId가 숫자인지 확인
            query += ` AND chat_rooms.category_id = ?`;
            queryParams.push(categoryId);
        }

        if (searchQuery && searchQuery.trim() !== '') {
            query += ` AND chat_rooms.title LIKE ?`;
            queryParams.push(`%${searchQuery}%`);
        }

        const [chatRooms, ] = await db.query(query, queryParams);

        for (let room of chatRooms) {
            const userList = getRoomUsers(room.room_id);
            room.user_list = userList;
            room.user_count = userList.length;
        }

        res.json(chatRooms);
    } catch (err) {
        console.error(`searchChatRoom 에러: ${err.message}`); // 에러 로그 한글로 기록
        res.status(500).json({ message: err.message });
    }
};