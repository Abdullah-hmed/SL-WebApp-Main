from flask import Flask, render_template
from flask_socketio import SocketIO
import base64, os
from io import BytesIO
from PIL import Image
import random
import numpy as np
import datetime
from functools import lru_cache
import threading
from ASLAlphabet import frameInference, load_model

app = Flask(__name__)
socketio = SocketIO(app, async_mode='threading', compression=True)


def model_available():
    models_dir = 'models'
    model_file = 'self_dataset_model_1.pth'
    drive_link = 'https://drive.google.com/uc?export=download&id=18yHJEYpNH7BF5mIF-kqiQteW_xqu7sVj'

    # Ensure the models directory exists
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    # Check if the model file exists
    model_path = os.path.join(models_dir, model_file)
    if os.path.exists(model_path):
        print("Model present, continue :)")
        return True
    else:
        print("Model not present, downloading...")

        try:
            gdown.download(drive_link, model_path, quiet=False)
            print(f"{model_file} downloaded and saved to {models_dir} folder.")
            return True
        except Exception as e:
            print(f"Failed to download {model_file} from Google Drive. Error: {str(e)}")
            return False


if model_available():
    model = load_model()
else:
    print("Exiting the application: Model Not Available.")
    exit(1)



@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('message')
def handle_message(data):
    threading.Thread(target=process_image, args=(data,)).start()

def process_image(data):
    
    # Process the received image data
    header, encoded = data.split(',', 1)
    
    # Decode the image data
    image_data = base64.b64decode(encoded)
    
    # Load the image using PIL
    image = Image.open(BytesIO(image_data))
    
    # image.save(f's/image_{datetime.datetime.now()}.jpg')
    
    # Process the image
    pred = frameInference(image, model)

    
    if pred is not None:
        
        pred_class, pred_confidence, processed_image = pred
        
        image_io = BytesIO()
        small_img = processed_image.resize((64, 64), Image.LANCZOS)
        gray_img = small_img.convert('L').transpose(method=Image.FLIP_LEFT_RIGHT)
        gray_img.save(image_io, format="JPEG", optimize=True, quality=10)  # Convert the PIL image to base64
        image_io.seek(0)
        
        response_message = {
            'class': pred_class, 
            'confidence': pred_confidence,
            'image': image_io.getvalue()
        }
        print(response_message.get('class'), response_message.get('confidence'))
        socketio.emit('prediction', response_message)
        
        print("Received image data")
    else:
        socketio.emit('prediction', {'class': "No Hand Detected", 'confidence': 0})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3000, debug=True, allow_unsafe_werkzeug=True)

