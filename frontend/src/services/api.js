export async function getHealth() {
  const response = await fetch("http://localhost:8000/health");

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
}


export async function createUser(userData) {
    const response = await fetch(
      "http://localhost:8000/api/users/test-user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );
  
    return response.json();
  }