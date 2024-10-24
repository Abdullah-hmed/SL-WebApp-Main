from flask import Flask, render_template
from flask_socketio import SocketIO
import base64
from io import BytesIO
from PIL import Image
import random
import numpy as np
import datetime
from functools import lru_cache
import threading
from ASLAlphabet import frameInference, load_model, getDevice

app = Flask(__name__)
socketio = SocketIO(app, async_mode='threading', compression=True)

device = getDevice()
model = load_model(device)

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
    pred = frameInference(image, model, device)

    
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
    socketio.run(app, host='0.0.0.0', port=3000, debug=True)
