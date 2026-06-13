const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ─── Auth Guard ───────────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
};
router.use(requireAuth);

// ─── Helper: normalize a DB todo row ─────────────────────────────────────────
function normalizeTodo(row, subtasks = []) {
  return {
    id:         row.id,
    text:       row.text,
    category:   row.category || 'General',
    completed:  !!row.completed,
    notified:   !!row.notified,
    sort_order: row.sort_order,
    createdAt:  row.created_at,
    dateTime:   row.date_time
      ? new Date(row.date_time).toISOString().slice(0, 16)
      : null,
    subtasks: subtasks.map(st => ({
      id:        st.id,
      text:      st.text,
      completed: !!st.completed
    }))
  };
}

// ─── GET /api/todos ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM todos WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC`,
      [req.session.userId]
    );

    const todos = [];
    for (const row of rows) {
      const [subtasks] = await db.query(
        'SELECT * FROM subtasks WHERE todo_id = ? ORDER BY id ASC',
        [row.id]
      );
      todos.push(normalizeTodo(row, subtasks));
    }

    res.json({ todos });
  } catch (err) {
    console.error('GET /todos error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── POST /api/todos/reorder  (MUST be before /:id) ──────────────────────────
router.post('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array.' });
    }

    for (let i = 0; i < orderedIds.length; i++) {
      await db.query(
        'UPDATE todos SET sort_order = ? WHERE id = ? AND user_id = ?',
        [i, orderedIds[i], req.session.userId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('POST /todos/reorder error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── POST /api/todos ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { text, category, dateTime } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Task text is required.' });
    }

    const [maxRow] = await db.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM todos WHERE user_id = ?',
      [req.session.userId]
    );
    const sortOrder   = maxRow[0].maxOrder + 1;
    const mysqlDT     = dateTime ? dateTime.replace('T', ' ') + ':00' : null;

    const [result] = await db.query(
      `INSERT INTO todos (user_id, text, category, date_time, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [req.session.userId, text.trim(), category || 'General', mysqlDT, sortOrder]
    );

    const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
    res.status(201).json({ todo: normalizeTodo(rows[0], []) });
  } catch (err) {
    console.error('POST /todos error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── PUT /api/todos/:id ───────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, category, dateTime, completed, notified, subtasks } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
      [id, req.session.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found.' });
    }
    const existing = rows[0];
    const mysqlDT  = dateTime !== undefined
      ? (dateTime ? dateTime.replace('T', ' ') + ':00' : null)
      : existing.date_time;

    await db.query(
      `UPDATE todos SET
         text      = ?,
         category  = ?,
         date_time = ?,
         completed = ?,
         notified  = ?
       WHERE id = ? AND user_id = ?`,
      [
        text      !== undefined ? text.trim() : existing.text,
        category  !== undefined ? category     : existing.category,
        mysqlDT,
        completed !== undefined ? (completed ? 1 : 0) : existing.completed,
        notified  !== undefined ? (notified  ? 1 : 0) : existing.notified,
        id,
        req.session.userId
      ]
    );

    // Replace subtasks if provided
    if (subtasks !== undefined) {
      await db.query('DELETE FROM subtasks WHERE todo_id = ?', [id]);
      for (const st of subtasks) {
        if (st.text && st.text.trim()) {
          await db.query(
            'INSERT INTO subtasks (todo_id, text, completed) VALUES (?, ?, ?)',
            [id, st.text.trim(), st.completed ? 1 : 0]
          );
        }
      }
    }

    const [updated]  = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
    const [newSubs]  = await db.query('SELECT * FROM subtasks WHERE todo_id = ? ORDER BY id ASC', [id]);
    res.json({ todo: normalizeTodo(updated[0], newSubs) });
  } catch (err) {
    console.error('PUT /todos/:id error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── DELETE /api/todos/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM todos WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /todos/:id error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
