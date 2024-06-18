const db = require('../database/db');

exports.getAllChatRooms = async (req, res) => {
    try {
        const [chatRooms, ] = await db.query(`
            SELECT chat_rooms.*, categories.category_name
            FROM chat_rooms 
            JOIN categories ON chat_rooms.category_id = categories.category_id
        `);

        for (let room of chatRooms) {
            const [userListResult, ] = await db.query(`
                SELECT users.name 
                FROM users 
                WHERE users.room_id = ?
            `, [room.room_id]);
            const userList = userListResult.map(user => user.name);
            room.user_list = userList;  // 직접 배열을 할당
            room.user_count = userList.length;
        }

        res.json(chatRooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createChatRoom = async (req, res) => {
    const { categoryId, title, totalMembers, name } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction(); // 트랜잭션 시작

        // 채팅방 생성
        const [roomResult] = await connection.query(`INSERT INTO chat_rooms (category_id, title, total_members, status) VALUES (?, ?, ?, 'active')`, [categoryId, title, totalMembers]);
        const roomId = roomResult.insertId;

        // 사용자 생성
        const [userResult] = await connection.query(`INSERT INTO users (name, room_id, status) VALUES (?, ?, 'active')`, [name, roomId]);

        await connection.commit(); // 모든 쿼리 성공 시 커밋
        res.status(201).json({ message: 'Chat room and user created', room_id: roomId, user_id: userResult.insertId });
    } catch (err) {
        await connection.rollback(); // 에러 발생 시 롤백
        res.status(500).json({ message: err.message });
    } finally {
        connection.release(); // 커넥션 반환
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
            const [userListResult, ] = await db.query(`
                SELECT users.name 
                FROM users 
                WHERE users.room_id = ?
            `, [room.room_id]);
            const userList = userListResult.map(user => user.name);
            room.user_list = userList;
            room.user_count = userList.length;

            res.json(room);
        } else {
            res.status(404).json({ message: 'Chat room not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateChatRoom = async (req, res) => {
    const { id } = req.params;
    const { categoryId, title, totalMembers, status } = req.body;
    try {
        const [result, ] = await db.query('UPDATE chat_rooms SET category_id = ?, title = ?, total_members = ?, status = ? WHERE room_id = ?', [categoryId, title, totalMembers, status, id]);
        if (result.affectedRows > 0) {
            res.json({ message: 'Chat room updated' });
        } else {
            res.status(404).json({ message: 'Chat room not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteChatRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const [result, ] = await db.query('DELETE FROM chat_rooms WHERE room_id = ?', [id]);
        if (result.affectedRows > 0) {
            res.json({ message: 'Chat room deleted' });
        } else {
            res.status(404).json({ message: 'Chat room not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getChatRoomsByCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        let query = `
            SELECT chat_rooms.*, categories.category_name
            FROM chat_rooms
            JOIN categories ON chat_rooms.category_id = categories.category_id
        `;
        let queryParams = [];

        if (categoryId !== '0') { // '0'으로 문자열 비교
            query += ` WHERE chat_rooms.category_id = ?`;
            queryParams.push(categoryId);
        }

        const [chatRooms, ] = await db.query(query, queryParams);

        for (let room of chatRooms) {
            const [userListResult, ] = await db.query(`
                SELECT users.name 
                FROM users 
                WHERE users.room_id = ?
            `, [room.room_id]);
            const userList = userListResult.map(user => user.name);
            room.user_list = userList;
            room.user_count = userList.length;
        }

        res.json(chatRooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.leaveChatRoom = async (req, res) => {
    const { roomId, userId } = req.body; // req.params에서 req.body로 변경
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction(); // 트랜잭션 시작

        // 사용자 삭제
        const [deleteUser] = await connection.query(`DELETE FROM users WHERE user_id = ? AND room_id = ?`, [userId, roomId]);
        if (deleteUser.affectedRows === 0) {
            throw new Error('User not found or already removed');
        }

        // 해당 채팅방에 남은 사용자 수 확인
        const [usersRemaining] = await connection.query(`SELECT COUNT(*) AS count FROM users WHERE room_id = ?`, [roomId]);
        if (usersRemaining[0].count === 0) {
            // 사용자가 없으면 채팅방 삭제
            const [deleteRoom] = await connection.query(`DELETE FROM chat_rooms WHERE room_id = ?`, [roomId]);
            if (deleteRoom.affectedRows === 0) {
                throw new Error('Chat room not found or already removed');
            }
        }

        await connection.commit(); // 모든 쿼리 성공 시 커밋
        res.json({ message: 'User and possibly chat room removed' });
    } catch (err) {
        await connection.rollback(); // 에러 발생 시 롤백
        res.status(500).json({ message: err.message });
    } finally {
        connection.release(); // 커넥션 반환
    }
};

