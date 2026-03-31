
try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    from werkzeug.utils import secure_filename
    from psycopg2 import sql
    import psycopg2.extras
    from psycopg2.extras import RealDictCursor
    from database import get_db_connection
    from flask_bcrypt import Bcrypt
    import os
    from dotenv import load_dotenv
    import requests
    from PIL import Image, ImageEnhance, ImageFilter
    import io
    import re
    from datetime import datetime
    from email_config import init_mail
    from flask_mail import Mail, Message
    print("✅ All imports successful!")
except ImportError as e:
    print(f"❌ Import failed: {e}")
    exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
