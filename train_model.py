import joblib
from sklearn.ensemble import RandomForestClassifier
from Datapreprocessing import X, y, vectorizer

# Train Random Forest
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X, y)  # <-- now X is already numeric (TF-IDF)

# Save model + vectorizer
joblib.dump(model, "dept_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("✅ Random Forest model trained and saved!")
