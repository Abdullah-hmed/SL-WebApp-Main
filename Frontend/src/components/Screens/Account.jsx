import { getToken, isAuthenticated, clearToken } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";

const logoutUser = async (navigate) => { 

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
                // alert(result.message);
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



function AccountScreen () {

    const navigate = useNavigate();

    return (
        <div className='items-center justify-center mx-2'>
            <div className='max-w-screen-md flex flex-col items-center justify-center'>
                Account
                <button 
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-500
                                    text-white w-full rounded-lg transition-all disabled:bg-gray-400"
                    onClick={() => logoutUser(navigate)}
                >
                    Log Out
                </button>
            </div>
        </div>
    )
}

export default AccountScreen