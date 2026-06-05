"""
BinaHub Backend - Entry point.
Run with: python run.py
Or directly: uvicorn app.main:app --reload --port 8001
"""

import uvicorn
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
    )
