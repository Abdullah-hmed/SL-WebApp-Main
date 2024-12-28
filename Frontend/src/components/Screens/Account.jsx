import { isAuthenticated, logoutUser, clearToken, getUserData, refreshUserData } from "../utils/authUtils";
import { useEffect, useState } from 'react';


import { useNavigate } from "react-router-dom";





function AccountScreen () {
    const navigate = useNavigate();
    
    const userData = getUserData();
    
    return (
        <div className='flex flex-col items-center justify-center mx-2'>
            <div className='max-w-screen-md flex flex-col items-center justify-center'>
                <h2>Account</h2>
                <div className="my-4">
                    {userData ? (
                        <>
                            <p>Name: <span className="font-semibold">{userData.username}</span></p>
                            <p>Email: <span className="font-semibold">{userData.email}</span></p>
                        </>
                    ) : (
                        <p>No user data found.</p>
                    )}
                </div>
                <button 
                    className="px-4 py-3 mb-4 bg-purple-600 hover:bg-purple-500
                                    text-white w-full rounded-lg transition-all disabled:bg-gray-400"
                    onClick={() => refreshUserData()}
                >
                    Refresh Data
                </button>
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