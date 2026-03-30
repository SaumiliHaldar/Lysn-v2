# test_extraction.py
# Use: python test_extraction.py
import os
import sys
from pdf_utils import process_pdf_mega_request
import io

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_on_pdf(filename):
    if not os.path.exists(filename):
        print(f"Error: {filename} not found.")
        return

    print(f"--- Starting test on {filename} ---")
    
    with open(filename, "rb") as f:
        # Pass the file object directly to the NEW V2 MEGA-REQUEST
        chapters = process_pdf_mega_request(f)
        
        print("\n--- Lysn V2 EXTRACTION RESULTS ---")
        if chapters and chapters[0].get("title") != "Error":
            print(f"✓ Found {len(chapters)} Chapters")
            for i, c in enumerate(chapters):
                quiz_count = len(c.get("quiz", []))
                print(f"  [{i+1}] {c.get('title')} ({len(c.get('content', ''))} chars) | Quiz: {quiz_count} MCQs")
                if c.get("summary"):
                    print(f"      Hook: {c.get('summary')}")
            
            print("\n--- CONTENT PREVIEW (Chapter 1) ---")
            print(chapters[0].get("content")[:500] + "...")
        else:
            print("✗ Extraction failed. Check if API Key is set or PDF is unreadable.")
        print("\n--- END TEST ---")

if __name__ == "__main__":
    # Change 'test.pdf' to whatever PDF you have in your backend folder
    test_pdf_name = "test.pdf"
    
    if len(sys.argv) > 1:
        test_pdf_name = sys.argv[1]
        
    test_on_pdf(test_pdf_name)
