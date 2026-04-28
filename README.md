# Lysn - v2

This repository contains the source code for Lysn, an advanced AI-powered platform designed to transform PDF documents - whether digital, scanned, or handwritten - into immersive audio experiences. Building on the original [Lysn](https://lysn.vercel.app) - this version introduces intelligent document understanding, chapter-based structuring, and interactive learning features, all within a modern web interface.

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Machine Learning Models](#machine-learning-models)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About the Project

Lysn is an innovative PDF-to-Audio platform that empowers users to listen to their documents anytime, anywhere. By leveraging advanced Text-to-Speech technology, it converts written content into natural speech, making information more accessible and convenient for students, professionals, and avid readers.

## Features

- **Instant PDF Conversion**: Upload any PDF and watch it transform into a clear, structured audio script in seconds.
- **Natural AI Voices**: Powered by Google Text-to-Speech (gTTS) for a human-like listening experience.
- **Cloud Library**: Your generated audios are stored securely in the cloud, accessible from any device.
- **Secure Authentication**: Supports both manual email/password login with OTP verification and seamless Google OAuth integration.
- **Smart Playback**: Stream audio with precision control, including background play, progress tracking, and duration display.
- **Automated Communication**: Welcome emails and OTPs integrated with Google Apps Script for reliable delivery.
- **Intelligent Extraction Pipeline**: Automatically detects and processes document types—digital text-searchable PDFs, scanned textbooks, and handwritten notes—through specialized extraction pipelines for optimal accuracy.
- **AI Chapter Summaries**: Automatically identifies chapters and topics in long PDFs, generating a navigable playlist with AI-powered summaries for each section.
- **Listen + Quiz Mode**: Interactive comprehension testing with AI-generated multiple-choice questions after each chapter.
- **Advanced Playback Controls**: Shuffle and repeat modes for flexible listening preferences, plus chapter navigation for non-linear content review.
- **Smart Caching**: Intelligent caching system avoids redundant processing of previously analyzed documents.

## Technologies Used

- **FastAPI**: Web framework for building high-performance, asynchronous APIs.
- **Python**: Core programming language for backend logic and audio processing.
- **Next.js (with TypeScript)**: React framework for building a fast, SEO-friendly, and interactive frontend.
- **MongoDB & GridFS**: NoSQL database for flexible data storage and handling large audio files.
- **gTTS (Google Text-to-Speech)**: Converts extracted text into high-quality speech.
- **PyPDF2**: Robust PDF text extraction for digital documents.
- **PyMuPDF (fitz)**: Advanced PDF processing with image extraction capabilities.
- **Google Gemini Vision API**: AI-powered text extraction and content analysis for complex documents, chapter extraction, and quiz generation.
- **EasyOCR**: Fallback OCR pipeline for scanned and image-based documents.
- **Tailwind CSS**: Utility-first CSS framework for stunning, responsive designs.
- **Framer Motion**: Library for creating smooth, complex animations.
- **Google Apps Script**: Backend integration for sending automated emails.

## Installation

### Backend Setup

1. **Clone the repository**:
    ```bash
    git clone https://github.com/SaumiliHaldar/Lysn.git
    cd Lysn/backend
    ```
2. **Create a virtual environment & activate it**:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```
3. **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4. **Create a `.env` file** in the `backend` directory:
    ```env
    MONGO_URI=your_mongodb_uri
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    REDIRECT_URI=http://localhost:8000/auth/google/callback
    ALLOWED_ORIGINS=http://localhost:3000
    GOOGLE_SCRIPT_URL=your_google_apps_script_url
    ```
5. **Run the application**:
    ```bash
    uvicorn app:app --reload
    ```

### Frontend Setup

1. **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```
2. **Install dependencies**:
    ```bash
    npm install
    ```
3. **Create a `.env.local` file**:
    ```env
    NEXT_PUBLIC_API_URL=your_backend_url.com
    ```
4. **Run the development server**:
    ```bash
    npm run dev
    ```

## Usage

- **Access the Platform**: Open [http://localhost:3000](http://localhost:3000).
- **Sign Up/Login**: Use your email (OTP verification) or sign in with Google.
- **Upload & Listen**: Upload your PDF documents and start listening immediately.

## Machine Learning Models

### Text Extraction (Intelligent Pipeline)
- **Digital Pipeline**: PyPDF2 for fast, structure-preserving extraction from text-searchable PDFs.
- **OCR Pipeline**: EasyOCR for high-accuracy extraction from scanned documents and clean image-based PDFs.
- **AI Vision Pipeline**: Google Gemini Vision API for context-aware extraction from handwritten notes, low-resolution images, and complex layouts.

### Text-to-Speech
- **gTTS (Google Text-to-Speech)**: Interfaces with Google Translate's text-to-speech API to generate spoken audio data.

### Content Analysis & Structuring
- **Gemini Flash Latest**: AI-powered chapter identification, summary generation, and quiz question creation from extracted document content.

## Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

Lysn is licensed under the MIT License.

## Contact

For any questions or feedback, please reach out to:

**Name**: Saumili Haldar  
**Email**: haldar.saumili843@gmail.com
