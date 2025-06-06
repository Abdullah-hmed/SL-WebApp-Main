import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import Webcam from 'react-webcam';
import io from 'socket.io-client';

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const WordWebcamProcessor = ({displayPreds = true, setParentPrediction, isPracticing, setIsPracticing}) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState({ class: 'Waiting...', confidence: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const socketRef = useRef(null);

  const FRAME_DELAY = 100; // Approximately 10 FPS as in the HTML example
  const TARGET_WIDTH = 640;
  const TARGET_HEIGHT = 480;

  // Callback to send frames, optimized with useCallback to prevent re-renders
  const sendFrame = useCallback(() => {
    if (!webcamRef.current || !canvasRef.current || isProcessing) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      setTimeout(sendFrame, FRAME_DELAY); // Try again if video isn't ready
      return;
    }

    // Set canvas dimensions to video dimensions for direct drawing
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality as in HTML example
    const base64Data = imageData.split(',')[1];

    if (socketRef.current?.connected) {
      socketRef.current.emit('frame', { image: base64Data });
      setIsProcessing(true); // Set processing to true until prediction is received
    }
    
    // Schedule next frame regardless of whether a prediction is received,
    // as per the HTML example's continuous sending.
    setTimeout(sendFrame, FRAME_DELAY);
  }, [isProcessing]); // Dependency on isProcessing to avoid unnecessary re-creation of the function

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io('http://127.0.0.1:2000', {
      transports: ['websocket'],
      cors: {
        origin: '*'
      }
    });

    // Handle incoming predictions
    socketRef.current.on('prediction', (data) => {
      const { label, confidence } = data; // Expecting 'label' and 'confidence'
      
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  
      const newPrediction = { class: capitalizedLabel, confidence };

      
      setPrediction(newPrediction);
      
      if(!!setParentPrediction){
        setParentPrediction(newPrediction);
      }
      
      setIsProcessing(false); // Mark as not processing after receiving a prediction
    });

    // Handle connection errors
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [setParentPrediction]); // Dependency on setParentPrediction to ensure effect reruns if it changes

  // Start processing when webcam is ready
  const handleWebcamLoad = useCallback(() => {
    sendFrame();
  }, [sendFrame]); // Dependency on sendFrame

  return (
    <div className="p-4 space-y-4 flex flex-col items-center justify-center">
      <div className="relative">
        <button
          className='absolute z-10 top-2 right-2 rounded-2xl text-purple-600 bg-black-50/5 p-1'
          onClick={() => setIsPracticing(!isPracticing)}><X /></button>
        <Webcam
          ref={webcamRef}
          onLoadedMetadata={handleWebcamLoad}
          className="rounded-lg"
          mirrored={true}
          width={TARGET_WIDTH}
          height={TARGET_HEIGHT}
          videoConstraints={{
            width: { ideal: TARGET_WIDTH },
            height: { ideal: TARGET_HEIGHT },
            facingMode: "user"
          }}
        />
        
        {/* Hidden canvas for processing */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>
      {displayPreds && (
        <div className="space-y-2">
          <div className="text-base">
            Prediction:{' '}
            <span className="text-green-600">{}</span>
            , Confidence:{' '}
            <span className={prediction.confidence > 0.5 ? 'text-green-600' : 'text-red-600'}>
              {(prediction.confidence * 100).toFixed(2)}%
            </span>
          </div>
          <div className="status text-center mt-2 italic text-gray-600">
            {socketRef.current?.connected ? "Connected!" : "Connecting..."}
            {isProcessing && " Processing..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordWebcamProcessor;