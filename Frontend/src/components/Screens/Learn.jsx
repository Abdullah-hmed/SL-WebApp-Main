import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRightIcon, Camera, ImageIcon, PlayIcon, LockKeyhole } from 'lucide-react';
import WebcamProcessor from '../WebcamProcessor';
import { useLocation } from 'react-router-dom';
import { getUserData } from '../utils/authUtils';


const WordDisplay = ({word, totalWords}) => {
    
    return (
        <div className="sm:p-4 p-2 mx-auto">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-purple-600 sm:mb-2">
                    {totalWords[word].sign_text}
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">
                    {totalWords[word].sign_description}
                </p>
            </div>
        </div>
    )
}

const NextWordButton = ({isPracticing, handleContentLoading}) => (
    <button 
        disabled={isPracticing}
        className={`flex flex-grow gap-2 items-center justify-center 
                    ${isPracticing ? 'bg-gray-200 text-gray-400' : 'bg-green-100 hover:bg-green-200 text-green-600'} 
                    px-4 py-2 rounded-lg mt-4`}
        onClick={handleContentLoading}
    >
        Next Word
        <ArrowRightIcon className="w-5 h-5" />
    </button>
)

const PracticeButton = ({isPracticing, setIsPracticing}) => {

    return (
        <button 
            className={`flex flex-grow gap-2 items-center justify-center bg-purple-100 hover:bg-purple-200
                text-purple-600 px-4 py-2 rounded-lg mt-4 ${isPracticing ? 'bg-purple-400 text-purple-800' : ''}`}
            onClick={() => setIsPracticing(!isPracticing)}
        >
            Practice Sign
            <Camera className="w-5 h-5" />
        </button>
    )
}

const Tabs = ({activeTab, setActiveTab, isPracticing}) => {
    return (
        <div className="flex justify-center mb-3 w-full 
                    border-gray-200 border rounded-xl bg-gray-100">
            <button 
                className={`flex flex-grow items-center justify-center gap-2 px-8 py-2 transition-all duration-300 rounded-s-xl
                            ${activeTab === 'image' ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                disabled={isPracticing}
                onClick={() => setActiveTab('image')}
            >
                <ImageIcon className='w-4 h-4' />
                Image
            </button>
            <button 
                className={`flex flex-grow items-center justify-center gap-2 px-8 py-2 transition-all duration-300 rounded-e-xl
                            ${activeTab === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                disabled={isPracticing}
                onClick={() => setActiveTab('video')}
            >
                <PlayIcon className='w-4 h-4' />
                Video
            </button>
        </div>
    )
}

const cardData = [
    {
        title: 'Alphabets',
        description: 'Learn the ASL Alphabets through Fingerspelling.',
        status: 'purple',
        url: 'alphabet',
        levelRequired: 1,
    },
    {
        title: 'Numbers',
        description: 'Learn the ASL Numbers.',
        status: 'green',
        url: 'number',
        levelRequired: 2,
    },
    {
        title: 'Greetings',
        description: 'Learn Basic Greetings in ASL.',
        status: 'red',
        url: 'greeting',
        levelRequired: 3,
    },
]

function LearnScreen () {

    const [word, setWord] = useState(0);
    const [totalWords, setTotalWords] = useState([]);
    const [isPracticing, setIsPracticing] = useState(false);
    const [contentLoading, setContentLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('image');
    const [prediction, setPrediction] = useState({ class: '', confidence: 0 });
    const userLevel = getUserData().level;

    const location = useLocation();
    const category = location.state?.category;

    const handlePrediction = (newPrediction) => {
        setPrediction(newPrediction);
        console.log('New Prediction:', newPrediction);
    };
    
    
    useEffect(() => {
        if(category) {
            const fetchWords = async () => {
                const response = await fetch(`http://localhost:5000/db/flashcards/${category}`);
                const data = await response.json();
                setTotalWords(data);
            };
            
            fetchWords();
        }
    }, [category]);

    if (!category) {
        const handleClick = (e, userLevel, lessonLevel) => {
            
            if (userLevel < lessonLevel) {
                e.preventDefault();
                toast.error(`You need to reach level ${lessonLevel} to unlock this lesson!`);
            }
        }
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <h1 className="text-xl font-semibold mb-5">Choose a Lesson</h1>
                <div className="flex flex-col gap-4">
                    {cardData.map((card, index) => (
                        
                        <Link
                            key={index} 
                            to={userLevel < card.levelRequired ? null : '/learn'}
                            onClick={(e) =>handleClick(e, userLevel, card.levelRequired)}
                            state={{category: card.url}}
                            className="px-8 py-4 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition-all"
                        >
                            <div className="text-center">
                            {
                                userLevel < card.levelRequired ? (
                                    <div className="flex items-center">
                                        <LockKeyhole className="w-auto h-4 mr-2" />
                                        <span>{card.title}</span>
                                    </div>
                                ) : (
                                    <span>{card.title}</span>
                                )
                            }

                            </div>
                        </Link>
                        
                    ))}
                    
                </div>
            </div>
        );
    }

    // Loading the content
    if (totalWords.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <div role="status">
                        <svg aria-hidden="true" className="inline w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }
    

    const handleContentLoading = () => {
        setContentLoading(true);
        setWord((word + 1) % totalWords.length);
    }

    const handleContentLoaded = () => {
        setContentLoading(false);
    }

    return (
        <div className='items-center justify-center mx-3'>



            <WordDisplay word={word} totalWords={totalWords} />
            
            <div className='max-w-screen-md p-5 flex flex-col items-center justify-center 
                            aspect-[600/400] mx-auto bg-white shadow-xl rounded-lg'>
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} isPracticing={isPracticing} />
                {isPracticing ? (
                    <>
                        <WebcamProcessor 
                            setParentPrediction={setPrediction}
                            isPracticing={isPracticing} 
                            setIsPracticing={setIsPracticing} 
                        />
                    </>
                ) : (activeTab === 'video' ? (
                            
                            <video
                                id="word-video"
                                className={`w-full h-full rounded-lg transition-opacity duration-300`}
                                crossOrigin='anonymous'
                                src={totalWords[word].video_url}
                                onClick={(e) => e.target.paused ? e.target.play() : e.target.pause()}
                                preload='auto'
                                autoPlay
                                muted
                            />

                            
                        ) : (
                            
                            <img 
                                id='word-image' 
                                className={`w-full h-full rounded-lg aspect-[600/400] 
                                    transition-opacity duration-300 ${contentLoading ? 'opacity-0' : 'opacity-100'}`}
                                onLoad={handleContentLoaded}
                                referrerPolicy='no-referrer'
                                src={totalWords[word].image_url} 
                                alt="word"
                            />
                        )
                    )
                }
                
                
                <div className='flex gap-3 justify-between w-full'>
                    <PracticeButton isPracticing={isPracticing} setIsPracticing={setIsPracticing}  />
                    <NextWordButton isPracticing={isPracticing} handleContentLoading={handleContentLoading} />
                </div>
            </div>
        </div>
    )
}


export default LearnScreen;