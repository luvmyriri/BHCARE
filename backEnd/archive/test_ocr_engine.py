import requests, os, io
from dotenv import load_dotenv
from PIL import Image

load_dotenv()
key = os.getenv('OCR_API_KEY')
print(f'API Key: {key}')

img = Image.new('RGB', (100, 50), color='white')
buf = io.BytesIO()
img.save(buf, 'JPEG')
buf.seek(0)

print("Testing OCREngine 1...")
try:
    resp = requests.post(
        'https://api.ocr.space/parse/image',
        files={'file': ('test.jpg', buf, 'image/jpeg')},
        data={'apikey': key, 'language': 'eng', 'OCREngine': '1'},
        timeout=30
    )
    data = resp.json()
    print(f'Engine 1 Result: {data.get("ErrorMessage")}')
except Exception as e:
    print(f'Engine 1 Error: {e}')
