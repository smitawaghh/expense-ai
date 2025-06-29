import { useEffect, useState } from 'react';
import axios from 'axios';

function ExpensesList() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    axios.get('/api/expenses')
      .then(response => setExpenses(response.data))
      .catch(error => console.error('Error fetching expenses:', error));
  }, []);

  return (
    <div>
      <h2>All Expenses</h2>
      {expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <ul>
          {expenses.map(exp => (
            <li key={exp._id}>
              <strong>{exp.title}</strong> - ₹{exp.amount} - {exp.category} - Paid to: {exp.paidTo} on {new Date(exp.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExpensesList;