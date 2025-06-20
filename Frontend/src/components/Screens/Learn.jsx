import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRightIcon, Camera, ImageIcon, PlayIcon, LockKeyhole } from 'lucide-react';
import WebcamProcessor from '../WebcamProcessor';
import WordWebcamProcessor from '../WordWebcamProcessor';
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
        title: 'Words',
        description: 'Learn Basic Words in ASL.',
        status: 'red',
        url: 'word',
        levelRequired: 2,
    },
]

const markAsRead = async (id) => {
    try {
        const response = await fetch('http://localhost:5000/db/flashcards_read/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                sign_id: id, 
                userId: getUserData().id
            }),
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to mark as read");
        }

        console.log("Success:", result);
        return result;

    } catch (error) {
        console.error("Error marking as read:", error);
        throw error;
    }
};

function LearnScreen () {

    const [wordIndex, setWordIndex] = useState(0); // Renamed for clarity
    const [availableWords, setAvailableWords] = useState([]); // Stores words not yet viewed
    const [isPracticing, setIsPracticing] = useState(false);
    const [contentLoading, setContentLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('image');
    const [prediction, setPrediction] = useState({ class: '', confidence: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const userLevel = getUserData().level;
    const userId = getUserData().id; // Although not used directly in this snippet, kept for consistency
    const location = useLocation();
    const category = location.state?.category || ''; 
    const handlePrediction = (newPrediction) => {
        setPrediction(newPrediction);
        console.log('New Prediction:', newPrediction);
    };
    
    
    useEffect(() => {
        if(category) {
            const fetchWords = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/db/flashcards_learn/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            userId: getUserData().id, 
                            category: category
                        }),
                    });
                    const data = await response.json();
                    console.log(data);
                    setAvailableWords(data); // Initialize availableWords with fetched data
                } catch (error) {
                    console.error('Error fetching words:', error);
                } finally {
                    setIsLoading(false);
                }
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
    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <div role="status">
                        <svg aria-hidden="true" className="inline w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    // Trigger "Lesson Complete!" if no available words
    if (availableWords.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-2xl font-semibold text-purple-600">Lesson Complete!</p>
                </div>
            </div>
        );
    }
    

    const handleContentLoading = () => {
        setContentLoading(true);
        
        // Mark the current word as read
        markAsRead(availableWords[wordIndex].id);
        console.log('Marking as read:', availableWords[wordIndex].id, ' Word: ', availableWords[wordIndex].sign_text);

        // Remove the current word from availableWords and reset index
        setAvailableWords(prevWords => {
            const newWords = prevWords.filter((_, idx) => idx !== wordIndex);
            if (newWords.length > 0) {
                setWordIndex(0); // Reset to 0 to show the first word in the new array
            } else {
                setWordIndex(0); // If no words left, ensure wordIndex is consistent (will be handled by "Lesson Complete" check)
            }
            return newWords;
        });
    }

    const handleContentLoaded = () => {
        setContentLoading(false);
    }

    // Get the current word to display for rendering
    const currentWord = availableWords[wordIndex];

    return (
        <div className='items-center justify-center mx-3'>

            <WordDisplay word={wordIndex} totalWords={availableWords} />
            
            <div className='max-w-screen-md p-5 flex flex-col items-center justify-center 
                            aspect-[600/400] mx-auto bg-white shadow-xl rounded-lg'>
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} isPracticing={isPracticing} />
                {isPracticing ? (
                    <>
                        {category === 'alphabet' ? (
                            <WebcamProcessor 
                                setParentPrediction={setPrediction}
                                isPracticing={isPracticing} 
                                setIsPracticing={setIsPracticing} 
                            />
                        ) : (
                            <WordWebcamProcessor 
                                setParentPrediction={setPrediction}
                                isPracticing={isPracticing} 
                                setIsPracticing={setIsPracticing} 
                            />
                        )}
                    </>
                ) : (activeTab === 'video' ? (
                            
                            <video
                                id="word-video"
                                className={`w-full h-full rounded-lg transition-opacity duration-300`}
                                crossOrigin='anonymous'
                                src={`https://dquwhuppqjgqqkkneohc.supabase.co/storage/v1/object/public/alphabet-videos/${currentWord?.video_url?.replace(/\.[^/.]+$/, '')}.mp4`}
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
                                src={`https://dquwhuppqjgqqkkneohc.supabase.co/storage/v1/object/public/alphabet-pics/${currentWord?.video_url}`} 
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