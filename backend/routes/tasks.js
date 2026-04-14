const express = require('express')
const router = express.Router()
const Task = require('../models/Task')

// ── GET /tasks — Fetch all tasks (newest first) ───────────
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message })
  }
})

// ── POST /tasks — Create a new task ──────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, priority } = req.body

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' })
    }

    const task = new Task({ title: title.trim(), priority: priority || 'medium' })
    const saved = await task.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task', details: err.message })
  }
})

// ── PUT /tasks/:id — Update a task (toggle or edit) ──────
router.put('/:id', async (req, res) => {
  try {
    const { completed, title, priority } = req.body
    const updateFields = {}

    if (typeof completed === 'boolean') updateFields.completed = completed
    if (title !== undefined) updateFields.title = title.trim()
    if (priority !== undefined) updateFields.priority = priority

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )

    if (!updated) return res.status(404).json({ error: 'Task not found' })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task', details: err.message })
  }
})

// ── DELETE /tasks/:id — Delete a task ────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Task not found' })
    res.json({ message: 'Task deleted', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task', details: err.message })
  }
})

module.exports = router
