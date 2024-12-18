import gdown
import torch
from torch import nn
import matplotlib.pyplot as plt
import os

from PIL import Image, ImageDraw
from collections import deque
from statistics import mode

import mediapipe as mp
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
from torch.utils.data import Subset
from timeit import default_timer as timer
import torch
from torchvision import transforms
from torch import nn
import torch.nn.functional as F


def getTransforms():
    transform = transforms.Compose([
        transforms.Resize((128,128), antialias=False),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])
    return transform

def check_gpu_availability():
    print("Checking GPU Availability:")
    print(f"CUDA Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA Device Name: {torch.cuda.get_device_name(0)}")
        print(f"CUDA Device Count: {torch.cuda.device_count()}")
        print(f"Current CUDA Device: {torch.cuda.current_device()}")
    else:
        print("No CUDA-capable GPU found")

check_gpu_availability()

device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Device: {device}")
transform = getTransforms()
class_names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
top3_preds = torch.zeros(3, dtype=torch.long, device=device)
top3_confidences = torch.zeros(3, device=device)

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    static_image_mode=False,  # Use tracking mode for video/continuous frames
    max_num_hands=1,  # Limit to fewer hands if possible
    min_detection_confidence=0.5,  # Adjust confidence threshold 
    min_tracking_confidence=0.5  # Lower can improve tracking speed
)

class SelfASLModel(nn.Module):
    def __init__(self, input_channels: int, hidden_units: int, output_shape: int):
        super().__init__()
        self.conv_block_1 = nn.Sequential(
            nn.Conv2d(in_channels=input_channels, out_channels=hidden_units, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units),
            nn.ReLU(),
            nn.Conv2d(in_channels=hidden_units, out_channels=hidden_units, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2)
        )
        self.conv_block_2 = nn.Sequential(
            nn.Conv2d(in_channels=hidden_units, out_channels=hidden_units*2, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units*2),
            nn.ReLU(),
            nn.Conv2d(in_channels=hidden_units*2, out_channels=hidden_units*2, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units*2),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2)
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(in_features=140*32*32, out_features=hidden_units*4),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(in_features=hidden_units*4, out_features=output_shape)
        )
    
    def forward(self, x):
        x = self.conv_block_1(x)
        x = self.conv_block_2(x)
        x = self.classifier(x)
        return x
    
def load_model(model_name="self_dataset_model_1"):
    current_dir = os.path.abspath(os.path.dirname(__file__))
    self_model = SelfASLModel(input_channels=3, hidden_units=70, output_shape=26).to(device)
    self_state_dict = torch.load(f'{current_dir}/models/{model_name}.pth', map_location=torch.device(device), weights_only=True)
    self_model.load_state_dict(self_state_dict)
    self_model = torch.jit.script(self_model)
    return self_model

def crop_to_hand(image, hand_landmarks):
    """
    Crop the image to the bounding box around the hand landmarks.
    """
    image_height, image_width, _ = image.shape

    # Get coordinates of all landmarks
    x_coords = [int(landmark.x * image_width) for landmark in hand_landmarks.landmark]
    y_coords = [int(landmark.y * image_height) for landmark in hand_landmarks.landmark]

    # Find the bounding box of the hand
    x_min, x_max = min(x_coords), max(x_coords)
    y_min, y_max = min(y_coords), max(y_coords)

    # Add some padding around the hand (optional)
    padding = 60
    x_min = max(0, x_min - padding)
    y_min = max(0, y_min - padding)
    x_max = min(image_width, x_max + padding)
    y_max = min(image_height, y_max + padding)

    # Crop the image to this bounding box
    cropped_image = image[y_min:y_max, x_min:x_max]

    # Resize and pad to make the image square
    return resize_and_pad(cropped_image, target_size=400)

def resize_and_pad(image, target_size=400):
    """
    Resize the image while preserving aspect ratio and pad it to make it square.
    """
    height, width = image.shape[:2]
    aspect_ratio = width / height

    if aspect_ratio > 1:
        # Width is larger, resize based on width
        new_width = target_size
        new_height = int(target_size / aspect_ratio)
    else:
        # Height is larger or equal, resize based on height
        new_height = target_size
        new_width = int(target_size * aspect_ratio)

    # Resize the image
    resized_image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)

    # Create a new square image with black padding
    square_image = np.zeros((target_size, target_size, 3), dtype=np.uint8)

    # Calculate padding
    pad_vert = (target_size - new_height) // 2
    pad_horz = (target_size - new_width) // 2

    # Place the resized image in the center of the square image
    square_image[pad_vert:pad_vert + new_height, pad_horz:pad_horz + new_width] = resized_image

    return square_image

def WebcamPipeline(transform, device, self_model, class_names):
    
    # Initialize MediaPipe Hands
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.7)
    mp_drawing = mp.solutions.drawing_utils



    # Initialize OpenCV VideoCapture
    capture = cv2.VideoCapture(0)

    frame_count = 0
    recent_predictions = deque(maxlen=5)

    while True:

        frame_count += 1

        ret, frame = capture.read()
        if not ret:
            break

        # Flip the image for a mirror effect
        frame = cv2.flip(frame, 1)

        # Convert the image from BGR to RGB for MediaPipe
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Process the frame to detect hands
        results = hands.process(frame_rgb)

        # Create a black background image
        black_background = np.zeros(frame.shape, dtype=np.uint8)

        # If hands are detected, draw the landmarks and crop around the hand
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:

                # Draw hand landmarks on the black background image
                mp_drawing.draw_landmarks(
                    black_background,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS
                )

                # Crop the image to the bounding box of the hand
                cropped_image = crop_to_hand(black_background, hand_landmarks)
                
                cropped_image_pil = Image.fromarray(cropped_image)

                # Convert the cropped image to a format compatible with your model
                input_tensor = transform(cropped_image_pil).to(device)
                input_tensor = input_tensor.unsqueeze(0)  # Add a batch dimension
                
                top3_preds = torch.tensor([0, 0, 0])
                top3_confidences = torch.tensor([0.0, 0.0, 0.0])


                if frame_count % 1 == 0:
                    with torch.no_grad():  # No need for gradient calculation during inference
                        output = self_model(input_tensor)
                        topk = torch.topk(output, 3)  # Get the top 3 predictions
                        top3_confidences, top3_preds = topk.values[0], topk.indices[0]
                    
                    # Get the predicted class (index of max value)
                    _, predicted_class = torch.max(output, 1)

                    recent_predictions.append(predicted_class.item())

        
                # Apply temporal smoothing by taking the mode of recent predictions
                if len(recent_predictions) > 0:
                    final_prediction = mode(recent_predictions)
                    class_name = class_names[final_prediction]
                else:
                    class_name = "Uncertain"

                # Display the prediction on the frame
                cv2.putText(cropped_image, f"Prediction: {class_name}", (10, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
                
                # Top 3 preds
                for i in range(3):
                    class_name = class_names[top3_preds[i].item()]
                    confidence = top3_confidences[i].item()
                    cv2.putText(cropped_image, f"{class_name}: {confidence:.2f}", (10, 70 + (i * 30)), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2, cv2.LINE_AA)
                

            # Show the cropped image
            cv2.imshow("Cropped Hand", cropped_image)

        # cv2.imshow('Original', frame)
        # cv2.imshow('Black Background', black_background)

        # Press Esc key to exit
        if cv2.waitKey(1) == 27:
            break

    # Cleanup
    capture.release()
    cv2.destroyAllWindows()



def frameInference(image, model):
    
    # Initialize MediaPipe Hands and Drawing utils
    


    # Convert PIL Image to numpy array
    image_np = np.array(image)

    # Process the frame to detect hands
    results = hands.process(image_np)

    # Check if hands were detected
    if not results.multi_hand_landmarks:
        print("No hand detected")
        return None

    # Create a black background image
    black_background = np.zeros((image.height, image.width, 3), dtype=np.uint8)
    
    

    # If hands are detected, draw the landmarks using MediaPipe's built-in function
    for hand_landmarks in results.multi_hand_landmarks:
        # Draw hand landmarks with white lines and red connectors
        mp_drawing.draw_landmarks(
            black_background, 
            hand_landmarks, 
            mp_hands.HAND_CONNECTIONS, 
            mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2, circle_radius=2),  # Red connectors for joints
            mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2, circle_radius=2)  # White lines for landmarks
            
        )
        cropped_image = crop_to_hand(black_background, hand_landmarks)
        # Convert the background with drawn landmarks to a PIL image
        cropped_image_pil = Image.fromarray(cropped_image)
        # Convert the cropped image to a format compatible with your model
        input_tensor = transform(cropped_image_pil).to(device)
        input_tensor = input_tensor.unsqueeze(0)  # Add a batch dimension

        with torch.inference_mode():
            output = model(input_tensor)
            probabilities = torch.nn.functional.softmax(output, dim=1)
            topk = torch.topk(probabilities, 3)
            top3_confidences, top3_preds = topk.values[0], topk.indices[0]

    # Get the top 3 predicted classes and confidences
    predictions = []
    for i in range(3):
        class_name = class_names[top3_preds[i].item()]
        confidence = top3_confidences[i].item()
        predictions.append((class_name, confidence))

    # Draw predictions on the image
    # draw = ImageDraw.Draw(cropped_image_pil)
    # for i, (class_name, confidence) in enumerate(predictions):
    #     draw.text((10, 10 + i * 20), f"{class_name}: {confidence:.2f}", fill="white")

    return class_names[top3_preds[0].item()], top3_confidences[0].item(), cropped_image_pil


if __name__ == "__main__":
    transform = getTransforms()
    class_names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    self_model = load_model(device, class_names, model_name='self_dataset_model_1')
    WebcamPipeline(transform, device, self_model, class_names, frame_delay=10)
