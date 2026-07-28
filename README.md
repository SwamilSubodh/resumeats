

# Resume–JD Analyzer

A full-stack **AI-powered Applicant Tracking System (ATS)** that evaluates how well a resume matches a job description using a hybrid approach combining **Machine Learning, Semantic Similarity, and Skill-Based Analysis**.



##  Overview

This project analyzes resumes against job descriptions and provides:

* Match Score (0–100%)
*  Score Breakdown (ML, Semantic, Keywords, Skills)
*  Matched Skills
*  Missing Skills
*  Actionable Suggestions
*  PDF Report Generation

---

##  Key Features

###  Hybrid Scoring System

Combines multiple techniques for realistic ATS behavior:

* **ML Model (XGBoost)** → overall match probability
* **Semantic Similarity (SBERT)** → meaning-based comparison
* **TF-IDF** → keyword matching
* **Skill Coverage** → checklist-based evaluation

---

###  Smart Skill Engine

* Skill extraction from resume & JD
* Synonym expansion (e.g., *ML → Machine Learning*)
* Cross-domain mapping (e.g., *process improvement → automation*)
* Inferred skills from context

---

###  Explainable Results

* Score breakdown for transparency
* Insights into strengths & gaps
* Resume improvement suggestions

---

###  Interactive UI

* Keyword highlighting (matched vs missing)
* Visual score indicators
* Analysis history tracking

---

###  Report Generation

* Downloadable PDF reports for each analysis


##  Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Machine Learning

* Python (Flask)
* XGBoost
* TF-IDF (scikit-learn)

### AI / NLP

* SBERT (all-MiniLM-L6-v2)
* Custom skill extraction engine

---

##  How It Works

1. Resume + Job Description are submitted
2. Backend processes text (cleaning + tokenization)
3. Skills are extracted and expanded
4. Multiple scores are computed:

   * ML score
   * Semantic similarity
   * TF-IDF similarity
   * Skill coverage
5. Final score is calculated using weighted combination
6. Suggestions are generated
7. Results displayed on dashboard

