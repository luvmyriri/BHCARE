import requests
import io
from PIL import Image

# Create a valid JPEG in memory
img = Image.new('RGB', (100, 50), color='white')
buf = io.BytesIO()
img.save(buf, 'JPEG')
buf.seek(0)
img_bytes = buf.read()

resp = requests.post(
    'http://localhost:5000/api/ocr-dual',
    data={'id_type': "Driver's License"},
    files={'front': ('test.jpg', img_bytes, 'image/jpeg')}
)

print(f"Status: {resp.status_code}")
try:
    print(resp.json())
except:
    print(resp.text)
