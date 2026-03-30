import os
import io
import fitz  # PyMuPDF
import easyocr
import numpy as np
import json
from google import genai
from google.genai import types
from PIL import Image
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Silence torch warnings for a cleaner console
import warnings
warnings.filterwarnings('ignore', category=UserWarning)

# Initialize EasyOCR Reader (fallback only)
reader = easyocr.Reader(['en'])

# Initialize the NEW Google GenAI client (Modern SDK)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def process_pdf_mega_request(file_obj):
    """
    ONE REQUEST = ONE PDF (Vision + Chapters + Quiz)
    This is the ultimate efficiency for the Free Tier (20 requests/day).
    """
    try:
        file_bytes = file_obj.read()
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        
        digital_text_parts = []
        scanned_images = []
        
        # 1. SCAN THE DOCUMENT: Separate digital text from scanned images
        for i, page in enumerate(doc):
            text = page.get_text().strip()
            if text:
                digital_text_parts.append(f"--- PAGE {i+1} (DIGITAL) ---\n{text}")
            else:
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                scanned_images.append(img)
                # Placeholder in text parts for the image sequence
                digital_text_parts.append(f"--- PAGE {i+1} (SCANNED/IMAGE) ---")

        doc.close()
        
        # 2. THE MEGA-PROMPT (Strict & Infinite)
        prompt = (
            "Act as a professional document analyst. "
            "I am providing you with a mix of digital text and scanned images from a PDF. "
            "Your task is to: "
            "1. EXTRACT 100% OF THE RAW TEXT (word-for-word) from the provided images and digital context. "
            "   ⚠️ CRITICAL: DO NOT SKIP, SUMMARIZE, OR SHORTEN any part of the text. "
            "   Every single sentence, date, name, and word from the original document must be preserved in the final 'content' fields. "
            "2. Group this FULL TEXT into 3-5 logical chapters/sections based on the content headings. "
            "3. For each chapter: "
            "   - Provide a concise 'title'. "
            "   - Provide a 2-sentence 'summary' (a hook). "
            "   - Estimate the 'start_time' in seconds (assuming a normal reading speed of 150 words per minute). "
            "   - Include the FULL, UNEDITED 'content' belonging to that chapter. "
            "   - Generate 3 high-impact MCQ 'quiz' questions for that chapter. "
            "Return the result only as a raw JSON list of objects: "
            "[{\"title\": \"...\", \"summary\": \"...\", \"start_time\": 0, \"content\": \"...\", \"quiz\": [{\"q\": \"...\", \"options\": [\"...\"], \"a\": \"...\"}]}]"
            "\n\nDigital Text Context for Full Transcription:\n" + "\n".join(digital_text_parts)
        )

        # 3. CALL GEMINI (THE ONE REQUEST)
        full_chapters = []
        if client:
            try:
                print("Invoking MEGA-REQUEST: Analyzing Full PDF (Vision + AI Logic)...")
                contents = [prompt] + scanned_images
                
                # Gemini Flash Latest (1.5) has a much higher free quota (1,500 RPD)
                response = client.models.generate_content(
                    model="gemini-flash-latest",
                    contents=contents
                )
                
                # Parse the AI's structured JSON response
                raw_json = response.text.replace('```json', '').replace('```', '').strip()
                full_chapters = json.loads(raw_json)
                
            except Exception as ai_e:
                print(f"Gemini Mega-Request Failed/Limited: {ai_e}. Falling back to basic extraction.")
                # We'll fall back to simple text if Gemini hits a limit
                full_chapters = [{"title": "Full PDF Content", "content": "\n".join(digital_text_parts), "summary": "Full document extraction (AI failed/limited)", "quiz": []}]
        else:
            # No API Key, use Digital only
            full_chapters = [{"title": "Full PDF Content", "content": "\n".join(digital_text_parts), "summary": "Digital-only extraction (No AI)", "quiz": []}]

        return full_chapters
        
    except Exception as e:
        print(f"Mega-Request Failure: {e}")
        return [{"title": "Error", "summary": "Pipeline failed", "content": "", "quiz": []}]

# Maintain backward compatibility for the app
def get_intelligent_text(file_obj):
    chapters = process_pdf_mega_request(file_obj)
    return "\n".join([c['content'] for c in chapters])

def get_chapters(text_unused):
    # This is now handled by process_pdf_mega_request, but kept as a stub
    return []
