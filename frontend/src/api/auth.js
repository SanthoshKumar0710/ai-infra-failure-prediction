import api from "./axios";

// ============================================================
// LOGIN (OAuth2 form-encoded: username = email)
// ============================================================

export async function loginUser(email, password) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const response = await api.post("/auth/login", form, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token, refresh_token } = response.data;

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

  return response.data;
}

// ============================================================
// REGISTER
// ============================================================

export async function registerUser(email, fullName, password) {
  const response = await api.post("/auth/register", {
    email,
    full_name: fullName,
    password,
  });

  return response.data;
}

// ============================================================
// LOGOUT
// ============================================================

export async function logoutUser() {
  const refreshToken = localStorage.getItem("refresh_token");

  try {
    if (refreshToken) {
      await api.post("/auth/logout", { refresh_token: refreshToken });
    }
  } catch {
    // Ignore — tokens may already be revoked/expired
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

// ============================================================
// GET ME (current user profile)
// ============================================================

export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data;
}
