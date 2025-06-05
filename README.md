# SignLingo

SignLingo is a web application designed to help users learn and practice sign language using advanced machine learning models.

## Features

- Interactive sign language recognition
- User-friendly web interface
- Real-time feedback and progress tracking

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/Abdullah-hmed/SL-WebApp-Main.git
cd SL-WebApp-Main
```

### 2. Create a Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 3. Install Requirements

```bash
pip install -r requirements.txt
```

### 4. Install PyTorch (CUDA 12.1)

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### 5. Install Backend and Frontend Dependencies

Navigate to the `Backend` and `Frontend` directories and install the required Node.js dependencies:

```bash
cd Backend
npm install
cd ../Frontend
npm install
cd ..
```

### 6. Install PM2 Globally

If you don't have PM2 installed globally, install it using npm:

```bash
npm install -g pm2
```

### 7. Run the Project with PM2

Start the entire project using PM2 and the provided ecosystem configuration:

```bash
pm2 start ecosystem.config.js
```