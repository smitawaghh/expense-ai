import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// ✅ Set axios base URL globally (use this ONLY)
axios.defaults.baseURL = 'https://expensetracker-ogdu.onrender.com';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: '',
    paidTo: '',
    date: ''
  });
  const [editId, setEditId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = () => {
    axios.get('/api/expenses')
      .then((res) => setExpenses(res.data))
      .catch(() => toast.error('Failed to fetch expenses'));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editId) {
      axios.put(`/api/expenses/${editId}`, form)
        .then(() => {
          resetForm();
          fetchExpenses();
          toast.success('Expense updated');
        })
        .catch(() => toast.error('Error updating expense'));
    } else {
      axios.post('/api/expenses', form)
        .then(() => {
          resetForm();
          fetchExpenses();
          toast.success('Expense added');
        })
        .catch(() => toast.error('Error adding expense'));
    }
  };

  const handleEdit = (expense) => {
    setForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      paidTo: expense.paidTo,
      date: expense.date.split('T')[0]
    });
    setEditId(expense._id);
  };

  const handleDelete = (id) => {
    axios.delete(`/api/expenses/${id}`)
      .then(() => {
        fetchExpenses();
        toast.success('Expense deleted');
      })
      .catch(() => toast.error('Error deleting expense'));
  };

  const resetForm = () => {
    setForm({ title: '', amount: '', category: '', paidTo: '', date: '' });
    setEditId(null);
  };

  const filteredExpenses = (filterCategory
    ? expenses.filter(exp => exp.category.toLowerCase() === filterCategory.toLowerCase())
    : expenses
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = filteredExpenses.reduce((acc, item) => acc + Number(item.amount), 0);

  const categoryColors = {
    Food: '#ffe0e0',
    Grocery: '#e0ffe0',
    Shopping: '#e0f0ff',
    Travel: '#fff3e0',
    Other: '#f0f0f0'
  };

  return (
    <div className="container">
      <h1>Expense Tracker</h1>
      <h2>Total Spent: ₹{total}</h2>

      {/* Category Filter Dropdown */}
      <div className="filter">
        <label>Filter by Category: </label>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All</option>
          <option value="Food">Food</option>
          <option value="Grocery">Grocery</option>
          <option value="Shopping">Shopping</option>
          <option value="Travel">Travel</option>
          <option value="Other">Other</option>
        </select>
        {filterCategory && (
          <button onClick={() => setFilterCategory('')}>Clear</button>
        )}
      </div>

      {/* Form Section */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required /><br />
          <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required /><br />
          <input type="text" name="category" placeholder="Category" value={form.category} onChange={handleChange} required /><br />
          <input type="text" name="paidTo" placeholder="Paid To" value={form.paidTo} onChange={handleChange} required /><br />
          <input type="date" name="date" value={form.date} onChange={handleChange} required /><br />
          <button type="submit">{editId ? 'Update Expense' : 'Add Expense'}</button>
          {editId && <button type="button" onClick={resetForm}>Cancel</button>}
        </form>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <ul>
          {filteredExpenses.map((expense) => (
            <li key={expense._id} className="card" style={{ backgroundColor: categoryColors[expense.category] || "#f9f9f9" }}>
              <strong>{expense.title}</strong> - ₹{expense.amount} to {expense.paidTo} on {new Date(expense.date).toLocaleDateString()}<br />
              <small>Category: {expense.category}</small><br />
              <button onClick={() => handleEdit(expense)}>Edit</button>
              <button onClick={() => handleDelete(expense._id)} style={{ marginLeft: '10px' }}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default App;