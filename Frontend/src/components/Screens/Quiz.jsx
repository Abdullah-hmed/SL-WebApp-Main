import React, { useEffect, useState } from 'react';
import { Camera, HelpCircle } from 'lucide-react';
import { useReward } from 'react-rewards';
import WebcamProcessor from '../WebcamProcessor';
const ProgressIndicator = ({ currentQuestion, totalWords, score }) => (
    <div className="flex justify-between items-center text-sm text-slate-600">
        <span>Question {currentQuestion + 1} of {totalWords.length}</span>
        <span>Score: {score}</span>
    </div>
)

const QuizCard = ({ isRecording, setIsRecording, currentQuestion, totalWords, prediction, setPrediction }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <h2 className="text-xl text-center">
              Show the sign for:
              <span className="block text-3xl font-bold mt-2 text-purple-600 transition-all duration-1000">
                {totalWords[currentQuestion].sign_text}
              </span>
            </h2>
          </div>
          
          <div className="p-3 space-y-3">
            {/* Camera preview area */}
            <div className="aspect-[600/400] bg-slate-100 rounded-lg flex items-center justify-center" onClick={() => setIsRecording(!isRecording)}>
              {!isRecording ? (
                <div className="text-center text-slate-500">
                  <Camera className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                  <p>Tap to start recording</p>
                </div>
              ) : (
                <div className='flex flex-col'>
                  <WebcamProcessor displayPreds={false} setParentPrediction={setPrediction} isPracticing={isRecording} setIsPracticing={setIsRecording} />
                  <div className="text-center">{`${prediction.class} (${(prediction.confidence * 100).toFixed(2)}%)`}</div>
                </div>
              )}
            </div>

            {/* Controls */}
            <button
                id='finalRewardId'
                onClick={() => setIsRecording(!isRecording)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isRecording 
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>
        </div>
)


const QuizScreen = () => {

    const { reward, isAnimating} = useReward('rewardId', 'confetti', {
        emoji: ['🎉', '✨'],
        elementCount: 20,
        spread: 30,
        lifetime: 100
    });

    const { reward: finalReward, isAnimating: isAnimatingFinalReward } = useReward('finalRewardId', 'emoji', {
        emoji: ['🎉', '✨'],
        elementCount: 20,
        spread: 10,
        lifetime: 100
    });
    
    const [isRecording, setIsRecording] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [prediction, setPrediction] = useState({ class: '', confidence: 0 });
    const [totalWords, setTotalWords] = useState([]);

    useEffect(() => {
      const fetchWords = async () => {
          const response = await fetch(`http://localhost:5000/db/flashcards_quiz/alphabet`);
          const data = await response.json();
          setTotalWords(data);
          console.log(data);
      };
      fetchWords();
    }, []);

    const questions = [
    { word: "A", hint: "ASL Sign for A" },
    { word: "B", hint: "ASL Sign for B" },
    { word: "C", hint: "ASL Sign for C" },
    { word: "D", hint: "ASL Sign for D" },
    { word: "E", hint: "ASL Sign for E" },
    { word: "F", hint: "ASL Sign for F" },
    { word: "G", hint: "ASL Sign for G" },
    { word: "H", hint: "ASL Sign for H" },
    { word: "I", hint: "ASL Sign for I" },
    { word: "J", hint: "ASL Sign for J" },
    { word: "K", hint: "ASL Sign for K" },
    { word: "L", hint: "ASL Sign for L" },
    { word: "M", hint: "ASL Sign for M" },
    { word: "N", hint: "ASL Sign for N" },
    { word: "O", hint: "ASL Sign for O" },
    { word: "P", hint: "ASL Sign for P" },
    { word: "Q", hint: "ASL Sign for Q" },
    { word: "R", hint: "ASL Sign for R" },
    { word: "S", hint: "ASL Sign for S" },
    { word: "T", hint: "ASL Sign for T" },
    { word: "U", hint: "ASL Sign for U" },
    { word: "V", hint: "ASL Sign for V" },
    { word: "W", hint: "ASL Sign for W" },
    { word: "X", hint: "ASL Sign for X" },
    { word: "Y", hint: "ASL Sign for Y" },
    { word: "Z", hint: "ASL Sign for Z" }
    ];

    useEffect(() => {
        if (totalWords.length > 0 && prediction.class === totalWords[currentQuestion].sign_text && prediction.confidence > 0.8) {
            setScore((score + 1) % totalWords.length);
            setCurrentQuestion((currentQuestion + 1) % totalWords.length);
            reward();
        }
    }, [prediction]);

    useEffect(() => {
        if(score === (totalWords.length - 1)) {
            finalReward();
        }
    }, [score]);

    if(totalWords.length === 0) {
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
      );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-screen-md mx-auto space-y-4">
            
            <ProgressIndicator currentQuestion={currentQuestion} totalWords={totalWords} score={score} />

            {/* Main quiz card */}
            <QuizCard isRecording={isRecording} setIsRecording={setIsRecording} currentQuestion={currentQuestion} totalWords={totalWords} prediction={prediction} setPrediction={setPrediction} />

            {/* Help text */}
            <div id='rewardId' className="flex items-center justify-center gap-2 text-sm text-center text-slate-500">
            <HelpCircle className="w-4 h-4" />
            <p>Position yourself in frame and make sure you're in a well-lit area</p>
            </div>
        </div>
        </div>
    );
};

export default QuizScreen;