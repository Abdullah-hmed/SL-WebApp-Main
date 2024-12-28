import { jwtDecode } from "jwt-decode";

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

export const saveUserData = (data) => {
  localStorage.setItem("userData", JSON.stringify(data));
}

export const getUserData = () => {
  return JSON.parse(localStorage.getItem("userData"));
}

export const clearUserData = () => {
  localStorage.removeItem("userData");
}


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
        // Saving data into localStorage
        const userData = await fetchUserData(response.accessToken);
        saveUserData(userData);
        console.log('Saving user data:', userData);
        return { success: true, data: result };
    }
    return { success: false, error: "No token received", data: result };
};

export const signupUser = async (formData) => {
    const response = await fetch('http://localhost:5000/auth/signup', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    
    return { success: true, message: "Signup successful!", data: result };
};


export const logoutUser = async (navigate) => { 

    try {
        const response = await fetch('http://localhost:5000/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        console.log(result);
        if (response.ok) {
            // Clear access token on client-side
            if(isAuthenticated()) {
                clearToken(); // Utility function to clear the token from localStorage
                clearUserData(); // Utility function to clear user data
                // Redirect user to the login page or handle logout UI
                navigate('/auth') // Adjust based on your app's routes    
            } else {
                console.log('User is not authenticated');
            }
        } else {
            console.error('Failed to log out:', result.message);
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
};


// Fetching user data
export const fetchUserData = async () => {
    const token = getToken();
    if (token) {
        const decodedToken = jwtDecode(token);
        
        const data = await getData(decodedToken.sub);
        if (data) {
            return data;
        } else {
            console.error('Failed to fetch user data');
        }
    } else {
        console.error('No tokens present');
    }
};

const getData = async (token) => {
    if (!token) {
        console.error('Token is required to fetch data');
        return null;
    }

    try {
        const response = await fetch('http://localhost:5000/auth/userdata', {
            method: 'POST',
            credentials: 'include', // Keep only if cookies are required
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: token }), // Adjust this if backend expects a different format
        });

        // Debugging Response
        console.log('Response Status:', response.status);

        const result = await response.json();

        if (!response.ok) {
            console.error('Failed to fetch data:', result.message || 'Unknown error');
            return null; // Return null or handle the error appropriately
        }

        return result;

    } catch (error) {
        console.error('Error fetching data:', error.message || error);
        throw error; // Re-throw if you want the caller to handle it
    }
};

export const refreshUserData = async () => {
    const token = getToken();
    if (token) {
        const decodedToken = jwtDecode(token);
        
        const data = await getData(decodedToken.sub);
        if (data) {
            localStorage.setItem("userData", JSON.stringify(data));
            console.log('User data refreshed', data);
        } else {
            console.error('Failed to fetch user data');
        }
    } else {
        console.error('No tokens present');
    }
};

export function getStoredUserData(key) {
    const userData = localStorage.getItem('userData'); // Ensure the correct key is used
    if (!userData) {
        console.error('No user data found in local storage');
        return null;
    }

    try {
        const parsedData = JSON.parse(userData);
        return parsedData[key] || null; // Return the value for the specified key
    } catch (error) {
        console.error('Failed to parse user data from local storage:', error);
        return null;
    }
}