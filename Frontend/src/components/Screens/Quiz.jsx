import React, { useEffect, useState } from 'react';
import { Camera, HelpCircle } from 'lucide-react';
import { useReward } from 'react-rewards';
import WebcamProcessor from '../WebcamProcessor';
const ProgressIndicator = ({ currentQuestion, questions, score }) => (
    <div className="flex justify-between items-center text-sm text-slate-600">
        <span>Question {currentQuestion + 1} of {questions.length}</span>
        <span>Score: {score}</span>
    </div>
)

const QuizCard = ({ isRecording, setIsRecording, currentQuestion, questions, prediction, setPrediction }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <h2 className="text-xl text-center">
              Show the sign for:
              <span className="block text-3xl font-bold mt-2 text-purple-600 transition-all duration-1000">
                {questions[currentQuestion].word}
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
        if (prediction.class === questions[currentQuestion].word && prediction.confidence > 0.8) {
            setScore((score + 1) % questions.length);
            setCurrentQuestion((currentQuestion + 1) % questions.length);
            reward();
        }
    }, [prediction]);

    useEffect(() => {
        if(score === (questions.length - 1)) {
            finalReward();
        }
    }, [score]);

    return (
        <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-screen-md mx-auto space-y-4">
            
            <ProgressIndicator currentQuestion={currentQuestion} questions={questions} score={score} />

            {/* Main quiz card */}
            <QuizCard isRecording={isRecording} setIsRecording={setIsRecording} currentQuestion={currentQuestion} questions={questions} prediction={prediction} setPrediction={setPrediction} />

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