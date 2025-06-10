import React, { useEffect, useState, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { useReward } from 'react-rewards';
import WebcamProcessor from '../WebcamProcessor';
import WordWebcamProcessor from '../WordWebcamProcessor';
import { getUserData } from '../utils/authUtils';

/** Progress Indicator */
const ProgressIndicator = ({ current, total, score }) => (
  <div className="flex justify-between items-center text-sm text-slate-600">
    <span>Questions remaining: {total}</span>
    <span>Score: {score}</span>
  </div>
);

/** Leitner logic (pure) */
const leitnerBoxMapping = Object.freeze({
  1: 1,
  2: 4,
  3: 7,
  4: 14,
  5: 30,
});

/** Backend flashcard update */
const updateFlashcard = async (signId, boxLevel, userId) => {
  try {
    const response = await fetch('http://localhost:5000/db/update_flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sign_id: signId, box_level: boxLevel, user_id: userId }),
    });
    const data = await response.json();
    if (!response.ok) console.error(data.error);
  } catch (err) {
    console.error('Update failed:', err.message);
  }
};

/** Can't remember logic */
const handleCantRemember = async ({ score, setScore, currentIndex, setCurrentIndex, totalWords }) => {
  const nextIndex = (currentIndex + 1) % totalWords.length;
  // setScore((score + 1) % totalWords.length);
  setCurrentIndex(nextIndex);
  await updateFlashcard(totalWords[currentIndex].flashcard_id, 1, getUserData().id);
};

/** Dynamic Webcam Processor Component */
const DynamicWebcamProcessor = ({ signType, displayPreds, setParentPrediction, isPracticing, setIsPracticing }) => {
  if (signType === 'word') {
    return (
      <WordWebcamProcessor
        displayPreds={displayPreds}
        setParentPrediction={setParentPrediction}
        isPracticing={isPracticing}
        setIsPracticing={setIsPracticing}
      />
    );
  }
  
  // Default to alphabet processor
  return (
    <WebcamProcessor
      displayPreds={displayPreds}
      setParentPrediction={setParentPrediction}
      isPracticing={isPracticing}
      setIsPracticing={setIsPracticing}
    />
  );
};

/** Webcam Card */
const WebcamCard = ({ isRecording, setIsRecording, prediction, setPrediction, signType }) => (
  <div
    className="aspect-[600/400] bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer"
    onClick={() => setIsRecording(!isRecording)}
  >
    {!isRecording ? (
      <div className="text-center text-slate-500">
        <Camera className="w-12 h-12 mx-auto mb-2 text-purple-400" />
        <p>Tap to start recording</p>
        <p className="text-xs mt-1 text-slate-400">
          {signType === 'word' ? 'Word Sign Detection' : 'Alphabet Sign Detection'}
        </p>
      </div>
    ) : (
      <div className="flex flex-col items-center">
        <DynamicWebcamProcessor
          signType={signType}
          displayPreds={false}
          setParentPrediction={setPrediction}
          isPracticing={isRecording}
          setIsPracticing={setIsRecording}
        />
        <div className="text-center">
          {`${prediction.class} (${(prediction.confidence * 100).toFixed(2)}%)`}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {signType === 'word' ? 'Word Detection Mode' : 'Alphabet Detection Mode'}
        </div>
      </div>
    )}
  </div>
);

/** Quiz Card */
const QuizCard = ({ word, isRecording, setIsRecording, prediction, setPrediction, handleCantRememberClick }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="p-3 border-b border-slate-100 text-center">
      <h2 className="text-xl">
        Show the sign for:
        <span className="block text-3xl font-bold mt-2 text-purple-600 transition-all duration-1000">
          {word.sign_flashcards.sign_text}
        </span>
        <span className="block text-sm text-slate-500 mt-1">
          ({word.sign_flashcards.sign_type})
        </span>
      </h2>
    </div>

    <div className="p-3 space-y-3">
      <WebcamCard 
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        prediction={prediction}
        setPrediction={setPrediction}
        signType={word.sign_flashcards.sign_type}
      />
      <div className="flex justify-between gap-2">
        <button
          id="finalRewardId"
          onClick={() => setIsRecording(!isRecording)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {isRecording && (
          <button
            onClick={handleCantRememberClick}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-red-500 text-white hover:bg-red-600"
          >
            Can't Remember
          </button>
        )}
      </div>
    </div>
  </div>
);

/** Main Quiz Screen */
const QuizScreen = () => {
  const { reward } = useReward('rewardId', 'confetti', {
    emoji: ['🎉', '✨'],
    elementCount: 20,
    spread: 30,
    lifetime: 100,
  });

  const { reward: finalReward } = useReward('finalRewardId', 'emoji', {
    emoji: ['🎉', '✨'],
    elementCount: 20,
    spread: 10,
    lifetime: 100,
  });

  const [isRecording, setIsRecording] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [prediction, setPrediction] = useState({ class: '', confidence: 0 });
  const [totalWords, setTotalWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWords = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/db/flashcards_quiz/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'alphabet',
          userId: getUserData().id,
        }),
      });
      const data = await response.json();
      setTotalWords(data);
      console.log(data);
    } catch (err) {
      console.error('Error fetching words:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    if (
      !isLoading &&
      prediction.class === totalWords[currentIndex]?.sign_flashcards.sign_text &&
      prediction.confidence > 0.8
    ) {
      const correctCard = totalWords[currentIndex];
  
      // Show confetti
      reward();
  
      // Update the backend flashcard progress
      updateFlashcard(
        correctCard.flashcard_id,
        correctCard.box_level + 1,
        getUserData().id
      );
  
      // Remove the current word from the list
      setTotalWords((prev) => {
        const newWords = [...prev];
        newWords.splice(currentIndex, 1); // remove current word
        return newWords;
      });
  
      // Reset prediction (to prevent double triggering)
      setPrediction({ class: '', confidence: 0 });
  
      // Adjust score
      setScore((prev) => prev + 1);
  
      // Update current index (avoid out-of-bound)
      setCurrentIndex((prevIndex) =>
        prevIndex >= totalWords.length - 1 ? 0 : prevIndex
      );
    }
  }, [prediction]);
  
  useEffect(() => {
    if (score === totalWords.length - 1) {
      finalReward();
    }
  }, [score, totalWords.length]);

  if(isLoading) {
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

  if (totalWords.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-2xl font-semibold text-purple-600">Nothing to study currently!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-screen-md mx-auto space-y-4">
        <ProgressIndicator current={currentIndex} total={totalWords.length} score={score} />
        <QuizCard
          word={totalWords[currentIndex]}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          prediction={prediction}
          setPrediction={setPrediction}
          handleCantRememberClick={() =>
            handleCantRemember({ score, setScore, currentIndex, setCurrentIndex, totalWords })
          }
        />
        <div id="rewardId" className="flex justify-center items-center" />
      </div>
    </div>
  );
};

export default QuizScreen;