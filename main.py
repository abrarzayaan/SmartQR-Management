import uvicorn
import os

if __name__ == "__main__":
    print("=" * 60)
    print(">> SmartQR Management Platform Starting...")
    print(">> Open your browser at: http://localhost:8000")
    print(">> API Documentation at: http://localhost:8000/docs")
    print("=" * 60)
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
