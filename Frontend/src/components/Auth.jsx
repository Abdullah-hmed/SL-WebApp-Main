import { useState } from 'react'
import { EyeIcon, EyeOff } from 'lucide-react';

function Auth() {
    const [isLogin, setIsLogin] = useState(false);
    const [serverResponse, setServerResponse] = useState("");

    const toggleButton = () => {
        return (
            <button 
            className='font-medium text-indigo-600 hover:text-indigo-500'
            onClick={() => setIsLogin(!isLogin)}>{ isLogin ? "Sign up" : "Login" }</button>
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted");
    
        const form = new FormData(e.target);
        const data = Object.fromEntries(form.entries());
        console.log(data); // Add to check form data
    
        const url = isLogin ? 'http://localhost:5000/auth/login' : 'http://localhost:5000/auth/signup';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    
        const result = await response.json();
        console.log(result);
        setServerResponse(result.message);
    };
    

    const InputField = ({type, placeholder, name}) => {
        return (
            <input type={type} placeholder={placeholder} name={name}
                    className="px-4 py-3 bg-gray-100 focus:ring-2 focus:ring-indigo-600 focus:outline-none w-full text-sm outline-[#333] rounded-lg transition-all" />
        )
    }

    const PasswordField = () => {
        const [showPassword, setShowPassword] = useState(false);

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        return (
            <div className="flex items-center flex-row gap-2">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter Password"
                        name='password'
                        className="px-4 py-3 bg-gray-100 focus:ring-2 focus:ring-indigo-600 focus:outline-none w-full text-sm outline-[#333] rounded-lg transition-all" />
                    <button 
                        type="button"
                        className='bg-gray-100 hover:bg-gray-200 px-3 py-3 rounded-lg transition-all'
                        onClick={togglePasswordVisibility}>
                        {showPassword ? <EyeOff /> : <EyeIcon />}
                    </button>
            </div>
        )
    }

    const AuthForm = () => {
        return (
            <div className="min-h-screen flex items-center justify-center text-center bg-gray-50">
                <div className="max-w-md w-full space-y-2 p-8 bg-white rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className='mt-2 text-sm text-gray-600'>{isLogin ? "Don't have an account?" : "Already have an account?"} {toggleButton()} </p>
                    {isLogin ? loginForm() : signupForm()}
                </div>
            </div>
        )
    }

    const loginForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <div className='flex flex-col gap-4 mt-5 mb-3'>
                    <InputField type="email" placeholder="Enter Email" name="email" />
                    <PasswordField />
                </div>
                <button className='px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white w-full rounded-lg transition-all'
                    type="submit">Login</button>
            </form>
        )
    }
    
    const signupForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <div className='flex flex-col gap-4 mt-5 mb-3'>
                    <InputField type="text" placeholder="Enter Username" name="username" />
                    <InputField type="email" placeholder="Enter Email" name="email" />
                    <PasswordField />
                </div>
                <button 
                    className='px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white w-full rounded-lg transition-all'
                    type="submit">Signup</button>
            </form>
        )
    }

    // TODO: Fix serverResponse Full Reload
    return (
        <div className="auth-container">
            {AuthForm()}
            {serverResponse && (
                <div className="mt-4 text-center text-sm text-red-500">
                    {serverResponse}
                </div>
            )}
        </div>
    )
}



export default Auth