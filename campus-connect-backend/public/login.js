function login() {
  const regNumber = document.getElementById("regNumber").value;
  const password = document.getElementById("password").value;

  if (!regNumber || !password) {
    document.getElementById("error-msg").innerText = "Please enter both reg number and password.";
    return;
  }

  fetch("http://localhost:5020/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ regNumber, password })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("welcome-msg").innerText = `Welcome, ${data.name}! 🎉`;
        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = `/dashboard.html?group=${data.group}`;
      } else {
        document.getElementById("error-msg").innerText = data.message;
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      document.getElementById("error-msg").innerText = "Something went wrong. Check console.";
    });
}
