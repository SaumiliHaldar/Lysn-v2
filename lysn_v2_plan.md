# Lysn v2: The "Just Works" PDF-to-Audio Experience

Lysn v2 transforms from a simple PDF reader into an intelligent document processing engine. It addresses the core student pain point: **handling scanned, image-based, and handwritten academic materials** that traditional tools fail to process.

---

## The Vision
> "Upload anything. Listen immediately. Learn better."

Lysn v2 will automatically detect document types and route them through the most effective extraction pipeline, ensuring a seamless experience regardless of source quality.

---

## Core Feature: Intelligent Extraction Pipeline
Lysn will now use a **Triple-Pipeline Architecture** for text extraction:

1. **Digital Pipeline (PyPDF2)**: 
   - *Target*: Modern, text-searchable PDFs.
   - *Advantage*: Blazing fast, preserves structure.
2. **OCR Pipeline (Tesseract)**: 
   - *Target*: Scanned textbooks, clean image-based PDFs.
   - *Advantage*: High accuracy for printed text in images.
3. **AI Vision Pipeline (Gemini Vision API)**: 
   - *Target*: Handwritten notes, low-res photos, complex layouts.
   - *Advantage*: Context-aware extraction where standard OCR fails.

---

## New Product Features

### 1. AI Chapter Summaries
- **What**: Automatically identifies chapters/topics in long PDFs.
- **Value**: Instead of one giant audio file, users get a navigable "playlist" of their textbook with AI-generated summaries for each section.

### 2. Listen + Quiz Mode
- **What**: Post-audio interactive quiz generation.
- **Value**: Active recall. After listening to a section, Lysn asks 3-5 high-impact questions based on the content to test comprehension.

### 3. Highlight to Audio
- **What**: Select a snippet of text to generate instant audio.
- **Value**: Quick review. Perfect for focusing on a specific complex definition or a summarized paragraph.

---

## Engineering Roadmap (4-Week Sprint)

### Week 1: The Intelligent Extraction Pipeline (Foundation)
- **Goal**: Implement the "Just Works" extraction logic.
- [ ] Implement `pdf_utils.py` with multi-stage extraction logic.
- [ ] **Detector**: Logic to check if a PDF page is searchable or an image.
- [ ] **OCR Pipeline**: Integrate **Tesseract OCR** (pytesseract) for scanned content.
- [ ] **Digital Pipeline**: Keep current **PyPDF2** logic for text-rich PDFs.
- [ ] Update `/pdf/upload` endpoint to route pages to the correct pipeline.

### Week 2: AI Intelligence & Chapterization
- **Goal**: Transition from raw text to structured, summarized content.
- [ ] Integrate **Gemini 1.5 Flash** for content analysis.
- [ ] **Chapter Splitting**: AI-driven logic to identify logical breaks in the text.
- [ ] **Section Summaries**: Generate high-level summaries for each chapter.
- [ ] **Quiz Engine**: Automated MCQ generation based on extracted text segments.

### Week 3: Enhanced Frontend UX & Navigation
- **Goal**: Visualize the new data structures and improve user control.
- [ ] **Multi-Status UI**: Add "Processing Status" (Extracting → Summarizing → Converting).
- [ ] **Chapter Navigation**: Update the Audio Player to support jumping between sections.
- [ ] **Quiz Modal**: Build the interactive interface for comprehension testing.
- [ ] **Responsive Design**: Ensure the new features work perfectly on table/mobile.

### Week 4: Performance, UX Polish & Launch
- **Goal**: Optimization and advanced interaction features.
- [ ] **Background Processing**: Use Celery or simple background tasks for long PDFs.
- [ ] **Highlight-to-Audio**: Implement the floating UI to select text and hear it immediately.
- [ ] **Caching**: Store extracted text/summaries to avoid redundant API/OCR calls.
- [ ] **Final Accuracy QA**: Benchmark against 95%+ accuracy target.

---

## Resume Highlight:
*"Implemented intelligent dual-pipeline text extraction — PyPDF2 for digital PDFs and Tesseract OCR for scanned/image-based documents — enabling Lysn to process any PDF format with 95%+ text accuracy."*
