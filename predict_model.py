# predict_model.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib

# Load the trained model and vectorizer
model = joblib.load("ai/dept_model.pkl")
vectorizer = joblib.load("ai/vectorizer.pkl")

# Initialize FastAPI
app = FastAPI()

# Define request body format
class ComplaintRequest(BaseModel):
    complaint: str

# API route for predictions
@app.post("/predict")
def predict_department(data: ComplaintRequest):
    # Convert complaint into vector
    X = vectorizer.transform([data.complaint])
    
    # Predict department
    prediction = model.predict(X)[0]
    
    return {"complaint": data.complaint, "predicted_department": prediction}
