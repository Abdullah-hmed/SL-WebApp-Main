import { useState } from 'react';
import Webcam from "react-webcam";
import { ArrowRightIcon, Camera, ImageIcon, PlayIcon } from 'lucide-react';
import WebcamProcessor from '../WebcamProcessor';

const words = [
    {
        word: "Hello",
        meaning: "Hi",
        image: "https://picsum.photos/id/23/600/400",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
        word: "Joe",
        meaning: "Mama",
        image: "https://picsum.photos/id/22/600/400",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    },
    {
        word: "Donald",
        meaning: "Trump",
        image: "https://picsum.photos/id/237/600/400",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    }
]

const WordDisplay = ({word}) => {
    
    return (
        <div className="sm:p-4 p-2 mx-auto">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-purple-600 sm:mb-2">
                    {words[word].word}
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">
                    {words[word].meaning}
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

function LearnScreen () {

    const [word, setWord] = useState(0);
    const [isPracticing, setIsPracticing] = useState(false);
    const [contentLoading, setContentLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('image');
    
    const handleContentLoading = () => {
        setContentLoading(true);
        setWord((word + 1) % words.length);
    }

    const handleContentLoaded = () => {
        setContentLoading(false);
    }


    return (
        <div className='items-center justify-center mx-3'>
            <WordDisplay word={word} setWord={setWord} />
            
            <div className='max-w-screen-md p-5 flex flex-col items-center justify-center 
                            aspect-[600/400] mx-auto bg-white shadow-xl rounded-lg'>
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} isPracticing={isPracticing} />
                {isPracticing ? (
                    <WebcamProcessor isPracticing={isPracticing} setIsPracticing={setIsPracticing} />
                ) : (activeTab === 'video' ? (
                            <video
                                id="word-video"
                                className={`w-full h-full rounded-lg transition-opacity duration-300`}
                                src={words[word].video}
                                onClick={(e) => e.target.paused ? e.target.play() : e.target.pause()}
                                autoPlay
                            />
                        ) : (
                            
                            <img 
                                id='word-image' 
                                className={`w-full h-full rounded-lg aspect-[600/400] 
                                    transition-opacity duration-300 ${contentLoading ? 'opacity-0' : 'opacity-100'}`}
                                onLoad={handleContentLoaded}
                                src={words[word].image} 
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