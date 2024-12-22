import React from 'react';
import { useState } from 'react';
import HomeScreen from './Screens/Home.jsx';
import LearnScreen from './Screens/Learn.jsx';
import QuizScreen from './Screens/Quiz.jsx';
import AccountScreen from './Screens/Account.jsx';
import { 
  Flame, 
  Heart,
  Trophy,
  Book,
  Gamepad,
  User,
  Home,
  CheckCircle,
  Lock,
  Crown,
  Star,
  Users,
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
    { name: 'Home', icon: Home },
    { name: 'Learn', icon: Book },
    { name: 'Quiz', icon: Gamepad },
    { name: 'Account', icon: User }
]

const BottomIcons = ({activeButton, setActiveButton}) => {
    const handleButtonClick = (name) => {
        setActiveButton(name);
    };
    
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 shadow-lg">
            <div className="max-w-lg mx-auto px-4 py-1">
                <div className="flex justify-around items-center">
                    {BottomButtons.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeButton === item.name;
                        return (
                            <button 
                                key={item.name}
                                className={`flex flex-col items-center gap-1 px-4 py-1 transition-all duration-300 rounded-xl ${isActive ? 'scale-105' : ''} `}
                                onClick={() =>handleButtonClick(item.name)}
                                >
                                <Icon className={`text-2xl ${isActive ? 'text-purple-600' : 'text-gray-600'} transition-transform duration-200`} />
                                <span className={`text-sm font-medium ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
                                    {item.name}
                                </span>
                            </button>
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
        <div className="flex justify-center">
            <BottomIcons activeButton={activeButton} setActiveButton={setActiveButton} />
        </div>
)};


function AppLayout () {
    const [activeButton, setActiveButton] = useState('Learn');

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 pb-20 select-none">
            <TopBar setActiveButton={setActiveButton} />
            {chooseComponent(activeButton)}
            <BottomBar activeButton={activeButton} setActiveButton={setActiveButton} />
        </div>
    );
};

export default AppLayout;