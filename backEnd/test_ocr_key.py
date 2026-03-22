import requests, os, io
from dotenv import load_dotenv
from PIL import Image

load_dotenv()
key = os.getenv('OCR_API_KEY')
print(f'API Key: {key}')

# Test with a minimal request to verify the key is valid
img = Image.new('RGB', (200, 100), color='white')
buf = io.BytesIO()
img.save(buf, 'JPEG')
buf.seek(0)

try:
    resp = requests.post(
        'https://api.ocr.space/parse/image',
        files={'file': ('test.jpg', buf, 'image/jpeg')},
        data={'apikey': key, 'language': 'eng', 'OCREngine': '2'},
        timeout=60
    )
    print(f'Status: {resp.status_code}')
    print(f'Raw response text: {resp.text[:2000]}')
except Exception as e:
    print(f'Error: {type(e).__name__}: {e}')
