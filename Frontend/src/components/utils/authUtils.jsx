export const saveToken = (token) => {
    localStorage.setItem("accessToken", token);
}

export const getToken = () => {
    return localStorage.getItem("accessToken");
}

export const clearToken = () => {
    localStorage.removeItem("accessToken");
}

export const isAuthenticated = () => {
    const token = getToken();
    return !!token;
}

// authService.js
export const loginUser = async (formData) => {
  const response = await fetch('http://localhost:5000/auth/login', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  
  if (result.accessToken) {
    saveToken(result.accessToken);
    return { success: true, data: result };
  }
  return { success: false, error: "No token received" };
};

export const signupUser = async (formData) => {
  const response = await fetch('http://localhost:5000/auth/signup', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  
  return { success: true, message: "Signup successful!" };
};