const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const predictionDiv = document.getElementById('prediction');
const processedImage = document.getElementById('processedImage');
const aspect = document.getElementById('aspectRatio');
FRAME_DELAY = 500;

// Establish WebSocket connection using Socket.IO
const socket = io();

let isProcessing = false;

// Access webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        // Start the cycle once video is ready
        video.onloadedmetadata = () => {
            sendFrame();
        };
    })
    .catch(err => {
        console.error("Error accessing webcam: ", err);
    });

function sendFrame() {
    if (isProcessing) return;

    isProcessing = true;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const currentAspectRatio = videoWidth / videoHeight;
    aspect.innerHTML = `Original Aspect Ratio: ${currentAspectRatio.toFixed(2)}`;
    const targetWidth = 640;
    const targetHeight = 480;
    const targetAspectRatio = targetWidth / targetHeight;
    
    let newWidth, newHeight;

    if(currentAspectRatio > targetAspectRatio) {
        newWidth = targetWidth;
        newHeight = targetWidth / currentAspectRatio;
    } else {
        newHeight = targetHeight;
        newWidth = targetHeight * currentAspectRatio;
    }

    // Clear the canvas and fill with black
    context.fillStyle = 'black';
    context.fillRect(0, 0, targetWidth, targetHeight);

    // Get position for the image
    const x = (targetWidth - newWidth) / 2;
    const y = (targetHeight - newHeight) / 2;

    // Draw Image
    context.drawImage(video, x, y, newWidth, newHeight);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    // Send image data through WebSocket
    socket.send(imageData);
}

// Handle the server's response
socket.on('prediction', (data) => {
    const className = data.class;
    const classConfidence = data.confidence;
    const processedImageData = data.image;
    
    const arrayBuffer = new Uint8Array(processedImageData).buffer; // Convert the image data to a Uint8Array
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
    const imageUrl = URL.createObjectURL(blob);

    let color = classConfidence > 0.5 ? 'green' : 'red';
    

    predictionDiv.innerHTML = `Prediction: <span style="color:green">${className}</span>, Confidence: <span style="color:${color}">${(classConfidence*100).toFixed(2)}%</span>`;
    if (processedImageData) {
        processedImage.src = imageUrl;
    }
    isProcessing = false;
    // Send the next frame immediately after receiving a prediction
    // sendFrame();

    setTimeout(sendFrame, FRAME_DELAY);
});
