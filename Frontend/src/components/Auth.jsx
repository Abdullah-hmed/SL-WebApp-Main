import { useState } from 'react'
import { EyeIcon, EyeOff } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
    saveToken, 
    saveUserData, 
    clearUserData, 
    fetchUserData,
    loginUser,
    signupUser,

} from './utils/authUtils';
import { isAuthenticated } from './utils/authUtils';



const InputField = ({type, placeholder, name}) => (
    <input 
        type={type} 
        placeholder={placeholder} 
        name={name}
        className="px-4 py-3 bg-gray-100 focus:ring-2 focus:ring-purple-600 focus:outline-none w-full text-sm outline-[#333] rounded-lg transition-all" 
    />
);

const PasswordField = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex items-center flex-row gap-2">
            <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter Password"
                name="password"
                className="px-4 py-3 bg-gray-100 focus:ring-2 focus:ring-purple-600 focus:outline-none w-full text-sm outline-[#333] rounded-lg transition-all" 
            />
            <button 
                type="button"
                className="bg-gray-100 hover:bg-gray-200 px-3 py-3 rounded-lg transition-all"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff /> : <EyeIcon />}
            </button>
        </div>
    );
};

const ToggleButton = ({isLogin, setIsLogin}) => (
    <button 
        type="button"
        className="font-medium text-purple-600 hover:text-purple-500"
        onClick={() => setIsLogin(!isLogin)}
    >
        {isLogin ? "Sign up" : "Login"}
    </button>
);

const Form = ({ isLogin, onSubmit, isLoading }) => {
    return (
        <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-4 mt-5 mb-3">
                {!isLogin && (
                    <InputField type="text" placeholder="Enter Username" name="username" />
                )}
                <InputField type="email" placeholder="Enter Email" name="email" />
                <PasswordField />
            </div>
            <button 
                type="submit"
                disabled={isLoading}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white w-full rounded-lg transition-all disabled:bg-gray-400"
            >
                {isLoading ? "Processing..." : (isLogin ? "Login" : "Sign up")}
            </button>
        </form>
    );
};

const AuthForm = ({ isLogin, setIsLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const nav = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const form = e.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());


            console.log(data);
            
            const result = await (isLogin ? loginUser(data) : signupUser(data));
            
            // If login is successful, redirect to home
            if (isLogin && result.success) {
                console.log(result.data);
                nav('/home');
            }
            // If signup is successful, redirect to login
            else if (!isLogin && result.success) {
                console.log(result.data);
                setIsLogin(true);
            }

            form.reset(); 
            
        } catch (error) {
            console.log(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center text-center bg-gray-50">
            <div className="max-w-md w-full space-y-2 p-8 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <ToggleButton isLogin={isLogin} setIsLogin={setIsLogin} />
                </p>
                <Form isLogin={isLogin} onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </div>
    );
};

function Auth() {
    const [isLogin, setIsLogin] = useState(true); // Start with login view
    

    return (
        <div className="auth-container">
            {isAuthenticated() ? <Navigate to="/home" /> : <AuthForm isLogin={isLogin} setIsLogin={setIsLogin} />}
        </div>
    );
}

export default Auth;