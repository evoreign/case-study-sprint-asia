const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const port = 4000;

console.log('DB_URL:', process.env.DB_URL);

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connection successful'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json());

// To-Do List Model
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  deadline: { type: Date, required: true, set: v => new Date(v) },
  status: { type: String, enum: ['todo', 'ongoing', 'completed'], default: 'todo' }
});

const Todo = mongoose.model('Todo', todoSchema);

// Routes
// Create a new to-do item
app.post('/todos', async (req, res) => {
  const { title, description, deadline } = req.body;
  const todo = new Todo({ title, description, deadline });
  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all to-do items
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific to-do item
app.get('/todos/:id', getTodo, (req, res) => {
  res.json(res.todo);
});

// Update a to-do item
app.patch('/todos/:id', getTodo, async (req, res) => {
  if (req.body.title != null) {
    res.todo.title = req.body.title;
  }
  if (req.body.description != null) {
    res.todo.description = req.body.description;
  }
  if (req.body.deadline != null) {
    res.todo.deadline = req.body.deadline;
  }
  if (req.body.status != null) {
    res.todo.status = req.body.status;
  }
  try {
    const updatedTodo = await res.todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get tasks grouped by status
app.get('/tasks', async (req, res) => {
  try {
    const todoTasks = await Todo.find({ status: 'todo' });
    const ongoingTasks = await Todo.find({ status: 'ongoing' });
    const completedTasks = await Todo.find({ status: 'completed' });

    const tasksGroupedByStatus = {
      todoTasks,
      ongoingTasks,
      completedTasks
    };

    res.json(tasksGroupedByStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task status (Alternative Approach with POST)
app.post('/todos/:id/status', getTodo, async (req, res) => {
  const { status, deadline } = req.body;

  try {
    // Update the existing todo item with the new status and deadline
    res.todo.status = status;
    res.todo.deadline = deadline || res.todo.deadline;

    const updatedTodo = await res.todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Delete a to-do item
app.delete('/todos/:id', getTodo, async (req, res) => {
  try {
    await res.todo.remove();
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get a single to-do item
async function getTodo(req, res, next) {
  let todo;
  try {
    todo = await Todo.findById(req.params.id);
    if (todo == null) {
      return res.status(404).json({ message: 'Cannot find todo' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.todo = todo;
  next();
}

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
  });
  next();
});

app.get('/', (req, res) => {
  res.send('API is up and running!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});