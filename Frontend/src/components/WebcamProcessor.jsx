import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Webcam from 'react-webcam';
import io from 'socket.io-client';

const WebcamProcessor = ({isPracticing, setIsPracticing}) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState({ class: '', confidence: 0 });
  const [aspectRatio, setAspectRatio] = useState(0);
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const socketRef = useRef(null);
  
  const FRAME_DELAY = 500;
  const TARGET_WIDTH = 640;
  const TARGET_HEIGHT = 480;

  useEffect(() => {
    // Initialize Socket.IO connection to localhost:3000
    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket'],
      cors: {
        origin: '*'
      }
    });

    // Handle incoming predictions
    socketRef.current.on('prediction', (data) => {
      const { class: className, confidence, image: processedImageData } = data;
      
      if (processedImageData) {
        const arrayBuffer = new Uint8Array(processedImageData).buffer;
        const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        setProcessedImageUrl(imageUrl);
      }

      setPrediction({ class: className, confidence });
      setIsProcessing(false);
      
      // Schedule next frame
      setTimeout(sendFrame, FRAME_DELAY);
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
  }, []);

  const sendFrame = () => {
    if (isProcessing || !webcamRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!video) return;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const currentAspectRatio = videoWidth / videoHeight;
    setAspectRatio(currentAspectRatio);

    const targetAspectRatio = TARGET_WIDTH / TARGET_HEIGHT;
    
    let newWidth, newHeight;

    if (currentAspectRatio > targetAspectRatio) {
      newWidth = TARGET_WIDTH;
      newHeight = TARGET_WIDTH / currentAspectRatio;
    } else {
      newHeight = TARGET_HEIGHT;
      newWidth = TARGET_HEIGHT * currentAspectRatio;
    }

    // Clear canvas and fill with black
    context.fillStyle = 'black';
    context.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    // Center the image
    const x = (TARGET_WIDTH - newWidth) / 2;
    const y = (TARGET_HEIGHT - newHeight) / 2;

    // Draw the frame
    context.drawImage(video, x, y, newWidth, newHeight);
    
    // Convert to JPEG and send
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    socketRef.current?.send(imageData);
  };

  // Start processing when webcam is ready
  const handleWebcamLoad = () => {
    sendFrame();
  };

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
        />
        
        {/* Hidden canvas for processing */}
        <canvas
          ref={canvasRef}
          width={TARGET_WIDTH}
          height={TARGET_HEIGHT}
          className="hidden"
        />
      </div>

      <div className="space-y-2">
        <div className="text-base">
          Prediction:{' '}
          <span className="text-green-600">{prediction.class}</span>
          , Confidence:{' '}
          <span className={prediction.confidence > 0.5 ? 'text-green-600' : 'text-red-600'}>
            {(prediction.confidence * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default WebcamProcessor;