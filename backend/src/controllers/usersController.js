const db = require('../database/db');

exports.getAllUsers = async (req, res) => {
    try {
        const [users, ] = await db.query('SELECT * FROM users');
        res.json(users);
    } catch (err) {
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
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createUser = async (req, res) => {
    const { roomId, name } = req.body;
    try {
        const [result, ] = await db.query(`INSERT INTO users (room_id, name, status) VALUES (?, ?, 'active')`, [roomId, name]);
        res.status(201).json({ message: 'User created', userId: result.insertId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { roomId, name, status } = req.body;
    try {
        const [result, ] = await db.query('UPDATE users SET room_id = ?, name = ?, status = ? WHERE user_id = ?', [roomId, name, status, id]);
        if (result.affectedRows > 0) {
            res.json({ message: 'User updated' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result, ] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);
        if (result.affectedRows > 0) {
            res.json({ message: 'User deleted' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
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
            res.status(404).json({ message: 'No users found for this room ID' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
