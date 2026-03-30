# test_extraction.py
# Use: python test_extraction.py
import os
import sys
from pdf_utils import get_intelligent_text
import io

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_on_pdf(filename):
    if not os.path.exists(filename):
        print(f"Error: {filename} not found.")
        return

    print(f"--- Starting test on {filename} ---")
    
    with open(filename, "rb") as f:
        # Pass the file object directly to the function
        text = get_intelligent_text(f)
        
        print("\n--- EXTRACTED TEXT (FIRST 500 CHARS) ---")
        if text:
            print(text[:500] + "...")
        else:
            print("No text extracted. Check if the PDF is empty or Tesseract is missing.")
        print("\n--- END TEST ---")

if __name__ == "__main__":
    # Change 'test.pdf' to whatever PDF you have in your backend folder
    test_pdf_name = "test.pdf"
    
    if len(sys.argv) > 1:
        test_pdf_name = sys.argv[1]
        
    test_on_pdf(test_pdf_name)
