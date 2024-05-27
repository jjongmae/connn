const db = require('../database/db');

async function getAllCategories(req, res) {
    try {
        const [rows] = await db.query('SELECT * FROM categories');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addCategory(req, res) {
    const { categoryName, description } = req.body;
    try {
        const [result] = await db.query('INSERT INTO categories (category_name, description) VALUES (?, ?)', [categoryName, description]);
        res.status(201).json({ message: 'Category added', categoryId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateCategory(req, res) {
    const { categoryName, description } = req.body;
    try {
        await db.query('UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?', [categoryName, description, req.params.id]);
        res.json({ message: 'Category updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteCategory(req, res) {
    try {
        await db.query('DELETE FROM categories WHERE category_id = ?', [req.params.id]);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory
};