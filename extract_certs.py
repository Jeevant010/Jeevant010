"""
Extract text from all PDFs in D:\Desktop\cofp\ and its subdirectories.
Outputs a single text file with all certificate info.
"""
import os
import fitz  # PyMuPDF

CERT_DIR = r"D:\Desktop\cofp"
OUTPUT_FILE = r"D:\Desktop\Jeevant\certificates_extracted.md"

def extract_pdf_text(pdf_path):
    """Extract text from a PDF file."""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        return f"[ERROR: {e}]"

def main():
    results = []
    
    for root, dirs, files in os.walk(CERT_DIR):
        for filename in sorted(files):
            if not filename.lower().endswith('.pdf'):
                continue
            
            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, CERT_DIR)
            text = extract_pdf_text(filepath)
            
            results.append(f"## 📄 {rel_path}\n")
            if text:
                # Limit to first 2000 chars per PDF to keep output manageable
                truncated = text[:2000]
                if len(text) > 2000:
                    truncated += "\n... [truncated]"
                results.append(truncated)
            else:
                results.append("[No text content extracted - may be image-based PDF]")
            results.append("\n---\n")
    
    output = f"# Extracted Certificate Data\n\nTotal PDFs processed: {len(results)//3}\n\n---\n\n"
    output += "\n".join(results)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(output)
    
    print(f"Done! Extracted text from {len(results)//3} PDFs")
    print(f"Output saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
