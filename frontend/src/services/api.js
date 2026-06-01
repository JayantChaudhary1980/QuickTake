const API_BASE_URL = "http://localhost:8000";

export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
}

export async function uploadAnalysis({ title, file }) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You must be logged in to upload.");
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/analyses/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to upload analysis");
  }

  return data;
}

export async function createUser(userData) {
    const response = await fetch(
      `${API_BASE_URL}/api/users/test-user`,
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