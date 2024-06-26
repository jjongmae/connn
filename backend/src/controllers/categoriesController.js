const db = require('../database/db');

async function getAllCategories(req, res) {
    try {
        const [rows] = await db.query('SELECT * FROM categories');
        res.json(rows);
    } catch (err) {
        console.error('카테고리 조회 중 에러:', err.message); // 에러 로그 한글로 기록
        res.status(500).json({ error: err.message });
    }
}

async function addCategory(req, res) {
    const { categoryName, description } = req.body;
    try {
        const [result] = await db.query('INSERT INTO categories (category_name, description) VALUES (?, ?)', [categoryName, description]);
        res.status(201).json({ message: '카테고리가 추가되었습니다', categoryId: result.insertId });
    } catch (err) {
        console.error('카테고리 추가 중 에러:', err.message); // 에러 로그 한글로 기록
        res.status(500).json({ error: err.message });
    }
}

async function updateCategory(req, res) {
    const { categoryName, description } = req.body;
    try {
        await db.query('UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?', [categoryName, description, req.params.id]);
        res.json({ message: '카테고리가 업데이트되었습니다' });
    } catch (err) {
        console.error('카테고리 업데이트 중 에러:', err.message); // 에러 로그 한글로 기록
        res.status(500).json({ error: err.message });
    }
}

async function deleteCategory(req, res) {
    try {
        await db.query('DELETE FROM categories WHERE category_id = ?', [req.params.id]);
        res.json({ message: '카테고리가 삭제되었습니다' });
    } catch (err) {
        console.error('카테고리 삭제 중 에러:', err.message); // 에러 로그 한글로 기록
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory
};