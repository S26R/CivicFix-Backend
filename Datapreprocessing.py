from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd

# Load dataset
df = pd.read_csv("complaints.csv")

# Complaint texts (X) and labels (y)
X = df["complaint"]
y = df["department"]

# TF-IDF Vectorizer
vectorizer = TfidfVectorizer(
    stop_words="english",   # remove common words like 'is', 'the'
    lowercase=True,         # convert everything to lowercase
    max_features=1000       # keep top 1000 words (change if dataset grows)
)

# Fit and transform complaints into numerical form
X_vec = vectorizer.fit_transform(X)

print("Shape of transformed data:", X_vec.shape)
print("Example features:", vectorizer.get_feature_names_out()[:20])
X = X_vec