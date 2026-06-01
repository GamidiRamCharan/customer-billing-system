// Using native fetch (Node.js >=18)

async function registerUser() {
  const response = await fetch('http://localhost:5000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Alice',
      lastName: 'Smith',
      mobile: '1234567890',
      email: 'alice@example.com',
      password: 'secret123'
    })
  });
  const data = await response.json();
  console.log('Response:', data);
}

registerUser().catch(err => console.error('Error:', err));
