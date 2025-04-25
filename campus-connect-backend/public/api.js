const apiUrl = "http://localhost:5020/api";

// Function to log in a user
export const login = async (regNumber, password) => {
  try {
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ regNumber, password })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API error:", error);
    return { success: false, message: "Network error" };
  }
};
