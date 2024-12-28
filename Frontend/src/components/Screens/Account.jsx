import { isAuthenticated, logoutUser, clearToken, getUserData, refreshUserData } from "../utils/authUtils";
import { useEffect, useState } from 'react';
import { UserCircle, RefreshCw, LogOut } from 'lucide-react';

import { useNavigate } from "react-router-dom";





function AccountScreen () {
    const navigate = useNavigate();
    
    const userData = getUserData();
    
    return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
            <div className='w-full max-w-md bg-white rounded-xl shadow-xl p-6'>
                <UserCircle className="w-16 h-16 mx-auto text-purple-600" />
                <h2 className="text-center font-semibold text-2xl text-gray-800">Account Information</h2>
                <div className="space-y-1 mb-8">
                    {userData ? (
                        <>
                        <div className="bg-gray-50 p-2 rounded-lg">
                            <p className="text-gray-600 mb-2">
                            Name
                            <span className="block text-lg font-semibold text-gray-900">
                                {userData.username}
                            </span>
                            </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                            <p className="text-gray-600 mb-2">
                            Email
                            <span className="block text-lg font-semibold text-gray-900">
                                {userData.email}
                            </span>
                            </p>
                        </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                        <p className="text-gray-500">No user data found.</p>
                        </div>
                    )}
                </div>
                <button 
                    className="flex items-center justify-center gap-2 px-4 py-3 mb-4 hover:bg-purple-600 bg-purple-50 text-purple-600
                    border border-purple-600 hover:text-white w-full rounded-lg transition-all disabled:bg-gray-400"
                    onClick={() => refreshUserData()}
                >
                    <RefreshCw className="hover:animate-spin" /> Refresh Data
                </button>
                <button 
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500
                                    text-white w-full rounded-lg transition-all disabled:bg-gray-400"
                    onClick={() => logoutUser(navigate)}
                >
                    <LogOut /> Log Out
                </button>
            </div>
        </div>
    )
}

export default AccountScreen