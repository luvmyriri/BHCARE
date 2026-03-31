from app import app
import os

# Override port to avoid conflict
if __name__ == '__main__':
    print("Starting test server on port 5001...")
    try:
        app.run(port=5001)
    except Exception as e:
        print(f"Failed to start server: {e}")
