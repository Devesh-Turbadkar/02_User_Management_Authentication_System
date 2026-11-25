const token = localStorage.getItem("access_token");
const message = document.getElementById("message");
if (!token) window.location.href = "/";
const headers = () => ({Authorization: `Bearer ${token}`, "Content-Type":"application/json"});

function showMessage(text, isError=false) {
  message.textContent = text; message.className = isError ? "error" : "";
}
async function api(path, options={}) {
  const response = await fetch(path, {...options, headers: {...headers(), ...(options.headers || {})}});
  if (response.status === 401) { localStorage.removeItem("access_token"); window.location.href="/"; }
  if (response.status === 204) return null;
  const body = await response.json();
  if (!response.ok) throw new Error(body.detail || "Request failed");
  return body;
}
async function loadProfile() {
  const user = await api("/users/me");
  document.getElementById("welcome").textContent = `Signed in as ${user.name} (${user.role})`;
  const form = document.getElementById("profile-form");
  form.elements.name.value = user.name; form.elements.email.value = user.email;
}
async function loadRecords() {
  const records = await api("/records/");
  const container = document.getElementById("records");
  container.replaceChildren();
  if (!records.length) { container.textContent = "No records yet. Add your first one above."; return; }
  records.forEach(record => {
    const item = document.createElement("article"); item.className = "record";
    const content = document.createElement("div");
    const title = document.createElement("strong"); title.textContent = record.title;
    const desc = document.createElement("p"); desc.textContent = record.description || "No description";
    content.append(title, desc);
    const actions = document.createElement("div");
    const edit = document.createElement("button"); edit.textContent = "Edit";
    edit.onclick = async () => {
      const titleValue = prompt("Record title:", record.title);
      if (titleValue === null) return;
      const description = prompt("Description:", record.description);
      if (description === null) return;
      try { await api(`/records/${record.id}`, {method:"PUT", body:JSON.stringify({title:titleValue, description})}); await loadRecords(); showMessage("Record updated."); }
      catch(error) {showMessage(error.message, true);}
    };
    const remove = document.createElement("button"); remove.textContent = "Delete"; remove.className = "danger";
    remove.onclick = async () => {
      if (!confirm("Delete this record?")) return;
      try { await api(`/records/${record.id}`, {method:"DELETE"}); await loadRecords(); showMessage("Record deleted."); }
      catch(error) {showMessage(error.message, true);}
    };
    actions.append(edit, remove); item.append(content, actions); container.append(item);
  });
}
document.getElementById("profile-form").addEventListener("submit", async e => {
  e.preventDefault(); const form=e.currentTarget;
  try { await api("/users/me", {method:"PUT", body:JSON.stringify({name:form.elements.name.value,email:form.elements.email.value})}); await loadProfile(); showMessage("Profile updated."); }
  catch(error){showMessage(error.message,true);}
});
document.getElementById("password-form").addEventListener("submit", async e => {
  e.preventDefault(); const form=e.currentTarget;
  try {
    await api("/auth/change-password", {method:"POST",body:JSON.stringify({current_password:form.elements.current_password.value,new_password:form.elements.new_password.value})});
    form.reset(); showMessage("Password changed. Please log in again on your next session.");
  } catch(error){showMessage(error.message,true);}
});
document.getElementById("record-form").addEventListener("submit", async e => {
  e.preventDefault(); const form=e.currentTarget;
  try { await api("/records/",{method:"POST",body:JSON.stringify({title:form.elements.title.value,description:form.elements.description.value})}); form.reset(); await loadRecords(); showMessage("Record added."); }
  catch(error){showMessage(error.message,true);}
});
document.getElementById("logout").onclick = () => {localStorage.removeItem("access_token");window.location.href="/";};
Promise.all([loadProfile(),loadRecords()]).catch(error=>showMessage(error.message,true));
