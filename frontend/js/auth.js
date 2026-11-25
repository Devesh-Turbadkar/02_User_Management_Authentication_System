const API = "";
const message = document.getElementById("message");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

function showMessage(text, isError=false) {
  message.textContent = text;
  message.className = isError ? "error" : "";
}
document.getElementById("show-login").onclick = () => {
  loginForm.classList.remove("hidden"); registerForm.classList.add("hidden");
  document.getElementById("show-login").classList.add("active");
  document.getElementById("show-register").classList.remove("active");
  showMessage("");
};
document.getElementById("show-register").onclick = () => {
  registerForm.classList.remove("hidden"); loginForm.classList.add("hidden");
  document.getElementById("show-register").classList.add("active");
  document.getElementById("show-login").classList.remove("active");
  showMessage("");
};

async function submitAuth(path, form) {
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch(`${API}/auth/${path}`, {
      method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "Request failed");
    localStorage.setItem("access_token", result.access_token);
    window.location.href = "/dashboard.html";
  } catch (error) { showMessage(error.message, true); }
}
loginForm.addEventListener("submit", e => {e.preventDefault(); submitAuth("login", loginForm);});
registerForm.addEventListener("submit", e => {e.preventDefault(); submitAuth("register", registerForm);});
