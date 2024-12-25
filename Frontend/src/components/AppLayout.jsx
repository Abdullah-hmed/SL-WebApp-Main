import React from 'react';
import { useState, Suspense} from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import HomeScreen from './Screens/Home.jsx';
import LearnScreen from './Screens/Learn.jsx';
import QuizScreen from './Screens/Quiz.jsx';
import AccountScreen from './Screens/Account.jsx';
import PageTransition from './utils/PageTransition.jsx';
import { 
  Book,
  Gamepad,
  User,
  Home,
  HandHeart
} from 'lucide-react';

const TopBar = ({setActiveButton}) => (
    <div className="bg-white shadow-md">
        <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex justify-center">
                
                <button 
                    className="flex items-center font-bold text-xl text-purple-500"
                    onClick={() => setActiveButton('Home')}
                >
                    <HandHeart className='w-8 h-8 mr-2' />
                    SignLingo
                </button>
            </div>
        </div>
    </div>
);

const BottomButtons = [
    { name: 'Home', path:'/', icon: Home },
    { name: 'Learn', path:'/learn', icon: Book },
    { name: 'Quiz', path:'/quiz', icon: Gamepad },
    { name: 'Account', path:'/account', icon: User }
]

const BottomIcons = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 shadow-lg">
            <div className="max-w-4xl mx-auto px-4 py-1">
                <div className="flex justify-around items-center">
                    {BottomButtons.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.path;
                        return (
                            <Link 
                                key={item.name}
                                to={item.path}
                                className={`flex flex-col items-center gap-1 px-4 py-1 w-full
                                        hover:bg-gray-100 transition-all duration-300 rounded-xl ${isActive ? 'scale-105' : ''} `}
                            >
                                <Icon className={`text-2xl ${isActive ? 'text-purple-600' : 'text-gray-600'} transition-transform duration-200`} />
                                <span className={`text-sm font-medium ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        )})
                    }
                </div>
            </div>
        </div>
    );
};

const chooseComponent = (activeButton) => {
    switch (activeButton) {
        case 'Home':
            return <HomeScreen />;
        case 'Learn':
            return <LearnScreen />;
        case 'Quiz':
            return <QuizScreen />;
        case 'Account':
            return <AccountScreen />;
        default:
            return null;
    }
};

const BottomBar = ({activeButton, setActiveButton}) => {
    return (
    <BottomIcons activeButton={activeButton} setActiveButton={setActiveButton} />
)};


const Loading = () => (
    <h3>Loading...</h3>
)


function AppLayout () {
    const [activeButton, setActiveButton] = useState('Home');
    

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 pb-20 
                        select-none">
            <Suspense fallback={<Loading />}>
                <PageTransition>
                    <Routes>
                        <Route path="/" element={<Navigate to="/home" />} />
                        <Route path="/home" element={<HomeScreen />} />
                        <Route path="/learn" element={<LearnScreen />} />
                        <Route path="/quiz" element={<QuizScreen />} />
                        <Route path="/account" element={<AccountScreen />} />
                    </Routes>
                </PageTransition >
            </Suspense>
            <BottomBar activeButton={activeButton} setActiveButton={setActiveButton} />
        </div>
    );
};

export default AppLayout;