const db = require('../database/db');

exports.getAllUsers = async (req, res) => {
    try {
        const [users, ] = await db.query('SELECT * FROM users');
        res.json(users);
    } catch (err) {
        console.error('모든 사용자 조회 중 에러 발생:', err); // 에러 로그 한글로 변경
        res.status(500).json({ message: err.message });
    }
};

exports.getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [user, ] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
        if (user.length > 0) {
            res.json(user[0]);
        } else {
            res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
        }
    } catch (err) {
        console.error(`ID가 ${id}인 사용자 조회 중 에러 발생:`, err); // 에러 로그 한글로 변경
        res.status(500).json({ message: err.message });
    }
};

exports.createUser = async (req, res) => {
    const { roomId, name } = req.body;
    try {
        // 채팅방의 현재 멤버 수 확인
        const [currentMembers, ] = await db.query('SELECT COUNT(*) as count FROM users WHERE room_id = ?', [roomId]);
        const [room, ] = await db.query('SELECT total_members FROM chat_rooms WHERE room_id = ?', [roomId]);

        if (currentMembers[0].count >= room[0].total_members) {
            return res.status(400).json({ message: '채팅방의 멤버 수가 한도에 도달했습니다' });
        }

        const [result, ] = await db.query(`INSERT INTO users (room_id, name, status) VALUES (?, ?, 'active')`, [roomId, name]);
        res.status(201).json({ message: '사용자가 생성되었습니다', userId: result.insertId });
    } catch (err) {
        console.error('사용자 생성 중 에러 발생:', err); // 에러 로그 한글로 변경
        res.status(500).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { roomId, name, status } = req.body;
    try {
        const [result, ] = await db.query('UPDATE users SET room_id = ?, name = ?, status = ? WHERE user_id = ?', [roomId, name, status, id]);
        if (result.affectedRows > 0) {
            res.json({ message: '사용자가 업데이트되었습니다' });
        } else {
            res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
        }
    } catch (err) {
        console.error(`ID가 ${id}인 사용자 업데이트 중 에러 발생:`, err); // 에러 로그 한글로 변경
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result, ] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);
        if (result.affectedRows > 0) {
            res.json({ message: '사용자가 삭제되었습니다' });
        } else {
            res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
        }
    } catch (err) {
        console.error(`ID가 ${id}인 사용자 삭제 중 에러 발생:`, err); // 에러 로그 한글로 변경
        res.status(500).json({ message: err.message });
    }
};

exports.getUsersByRoomId = async (req, res) => {
    const { roomId } = req.params;
    try {
        const [users, ] = await db.query('SELECT * FROM users WHERE room_id = ?', [roomId]);
        if (users.length > 0) {
            res.json(users);
        } else {
            res.status(404).json({ message: '해당 방 ID에 대한 사용자를 찾을 수 없습니다' });
        }
    } catch (err) {
        console.error(`방 ID가 ${roomId}인 사용자 조회 중 에러 발생:`, err); // 에러 로그 한글로 변경
        res.status(500).json({ message: err.message });
    }
};