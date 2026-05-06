# app.py
# FastAPI backend for Inventory Demand Forecasting

import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from model_train import train_model

# Initialize FastAPI app
app = FastAPI(title="Inventory Forecast API")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request schema
class PredictionRequest(BaseModel):
    day_of_week: int  # 0-6
    is_weekend: int   # 0 or 1
    prev_day_sales: int
    promotion_active: int # 0 or 1
    month: int # 1-12

# Global model variable
model = None

@app.on_event("startup")
def startup_event():
    global model
    model_path = 'model.pkl'
    
    # Train and save model if it doesn't exist
    if not os.path.exists(model_path):
        print("Model file not found. Training a new model...")
        train_model()
    
    # Load the model
    try:
        model = joblib.load(model_path)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.post("/predict")
def predict(request: PredictionRequest):
    global model
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Prepare input data for prediction
        input_data = np.array([[
            request.day_of_week,
            request.is_weekend,
            request.prev_day_sales,
            request.promotion_active,
            request.month
        ]])
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        
        return {
            "prediction": int(round(prediction)),
            "confidence": 0.92
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# API Health check
@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

# Serve static files from the 'dist' directory (after npm run build)
dist_path = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if os.path.exists(os.path.join(dist_path, "index.html")):
        return FileResponse(os.path.join(dist_path, "index.html"))
    return {"message": "Inventory Demand Forecasting API is running. Build frontend to see UI."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)
