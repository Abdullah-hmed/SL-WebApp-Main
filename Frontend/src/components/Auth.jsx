import { useState } from 'react'
import { EyeIcon, EyeOff } from 'lucide-react';

const InputField = ({type, placeholder, name}) => (
    <input 
        type={type} 
        placeholder={placeholder} 
        name={name}
        className="px-4 py-3 bg-gray-100 focus:ring-2 focus:ring-indigo-600 focus:outline-none w-full text-sm outline-[#333] rounded-lg transition-all" 
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
                className="px-4 py-3 bg-gray-100 focus:ring-2 focus:ring-indigo-600 focus:outline-none w-full text-sm outline-[#333] rounded-lg transition-all" 
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
        className="font-medium text-indigo-600 hover:text-indigo-500"
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
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white w-full rounded-lg transition-all disabled:bg-gray-400"
            >
                {isLoading ? "Processing..." : (isLogin ? "Login" : "Sign up")}
            </button>
        </form>
    );
};

const AuthForm = ({ isLogin, setIsLogin, setServerResponse }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setServerResponse("");

        try {
            const form = new FormData(e.target);
            const data = Object.fromEntries(form.entries());

            console.log(data);
            
            const url = isLogin ? 'http://localhost:5000/auth/login' : 'http://localhost:5000/auth/signup';
            
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || "Authentication failed");
            }

            console.log(result);

            setServerResponse(result.message);
        } catch (error) {
            setServerResponse(error.message);
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
    const [serverResponse, setServerResponse] = useState("");

    return (
        <div className="auth-container">
            <AuthForm 
                isLogin={isLogin} 
                setIsLogin={setIsLogin} 
                setServerResponse={setServerResponse} 
            />
            {serverResponse && (
                <div className={`mt-4 text-center text-sm ${
                    serverResponse.includes("logged in" || "sucessfully") ? "text-green-500" : "text-red-500"
                }`}>
                    {serverResponse}
                </div>
            )}
        </div>
    );
}

export default Auth;