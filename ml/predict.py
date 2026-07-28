from flask import Flask, request, jsonify
import joblib
import numpy as np
import re
import string

app = Flask(__name__)

# Load artifacts once
model = joblib.load("xgb_model.pkl")
tfidf = joblib.load("tfidf.pkl")
scaler = joblib.load("scaler.pkl")

def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"\S+@\S+", "", text)
    text = re.sub(r"\d+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    return text

def overlap(jd, resume):
    return len(set(jd.split()) & set(resume.split()))

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    jd = clean_text(data.get("jd", ""))
    resume = clean_text(data.get("resume", ""))

    # TF-IDF features (same as training!)
    jd_vec = tfidf.transform([jd])
    resume_vec = tfidf.transform([resume])

    X_diff = jd_vec - resume_vec

    ov = overlap(jd, resume)
    len_diff = abs(len(jd) - len(resume))

    X = np.hstack([
        X_diff.toarray(),
        [[ov, len_diff]]
    ])

    X_scaled = scaler.transform(X)

    probs = model.predict_proba(X_scaled)[0]
    confidence = float(np.max(probs))  # 0–1

    return jsonify({"mlScore": confidence})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)