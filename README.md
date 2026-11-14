# 🎓 Student Mental Health Score Predictor

### MindScope AI: predict a student's mental health score from social media usage and lifestyle habits

A complete machine learning web application. A trained **regression model** is served through a **FastAPI** backend, and a modern **HTML, CSS and JavaScript** frontend lets anyone enter their details and get a predicted score instantly.

> ⚠️ **Disclaimer:** This is an educational and research-oriented machine learning project. Its predictions are **not a clinical diagnosis** or a substitute for professional mental healthcare.

---

## 🌐 Live Demo

| Part | Link |
|---|---|
| 🖥 **Frontend (website)** | https://student-mental-health-score-predictor-wkrq.onrender.com |
| ⚙️ **Backend (API)** | https://student-mental-health-score-predictor-mkbp.onrender.com |
| 📘 **API docs (Swagger)** | https://student-mental-health-score-predictor-mkbp.onrender.com/docs |

> ⏳ **Note:** Both services are hosted on Render's free plan. If nobody has used them for a while they go to sleep, so the **first request can take 30 to 60 seconds**. Please wait and try again.

---

## 📌 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Dataset](#-dataset)
3. [How the Project Works](#-how-the-project-works)
4. [Features](#-features)
5. [Tech Stack](#-tech-stack)
6. [Project Structure](#-project-structure)
7. [Run the Project Locally](#-run-the-project-locally)
8. [Deployment on Render](#-deployment-on-render)
9. [API Reference](#-api-reference)
10. [Troubleshooting](#-troubleshooting)
11. [Future Improvements](#-future-improvements)

---

## 🎯 Problem Statement

The goal is to predict a student's **`Mental_Health_Score`** (a continuous score of roughly 3 to 10) from their social media habits, study time, sleep, physical activity, and stress level.

Because the target is a **number, not a category**, this is a **regression problem**.

## 📊 Dataset

**File:** `Student_Social_Media_And_Mental_Health_Impact.csv`, with **5,000 students** and **13 columns**.

| Category | Columns |
|---|---|
| Demographics | `Age`, `Gender`, `Country` |
| Academic | `Academic_Level`, `Study_Hours` |
| Social media usage | `Most_Used_Platform`, `Purpose_of_Use`, `Avg_Daily_Usage_Hours`, `Daily_Unlocks` |
| Lifestyle | `Physical_Activity_Hours`, `Sleep_Hours_Per_Night` |
| Wellbeing | `Stress_Level` |
| **Target** | **`Mental_Health_Score`** |

## 🔄 How the Project Works

```
 User fills the form  ──►  Frontend (JavaScript)  ──►  Backend (FastAPI)  ──►  ML Model (.pkl)
        ▲                                                                           │
        └──────────────  Predicted score shown on the result card  ◄────────────────┘
```

1. The user enters 12 details on the website.
2. The frontend checks the inputs and sends them to the backend.
3. The backend passes them to the trained model.
4. The model's predicted score comes back and is displayed with an animation.

## ✨ Features

- 🤖 Real predictions from the trained model, with no fake or hardcoded values
- 🎨 Modern, responsive design (desktop, tablet, mobile)
- ✅ Form validation with clear error messages
- 🔢 Animated score counter and circular progress ring
- 🔔 Toast notifications for success and errors
- 🔎 Searchable country field

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Machine Learning | Python, regression model saved as `.pkl` |
| Backend | FastAPI, Uvicorn |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Hosting | Render |

## 📁 Project Structure

```
Student-mental-health-score-predictor/
│
├── main.py                    # FastAPI backend
├── Mental_Health_Model.pkl    # Trained model
├── requirements.txt           # Python dependencies
├── index.html             # Page structure
├── style.css              # Styling and animations
└── script.js              # Validation and API connection
```

---

## 💻 Run the Project Locally

### Prerequisites

- Python 3.9 or newer
- Git
- A modern web browser

### Step 1: Clone the repository

```bash
git clone https://github.com/akshatamandhare/Student-mental-health-score-predictor.git
cd Student-mental-health-score-predictor
```

### Step 2: Create and activate a virtual environment

```bash
python -m venv venv
```

Activate it:

- **Windows:** `venv\Scripts\activate`
- **macOS / Linux:** `source venv/bin/activate`

### Step 3: Install dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Start the backend

Run this from the project root, where `main.py` is:

```bash
uvicorn main:app --reload
```

The backend is now running at **http://127.0.0.1:8000**. Open **http://127.0.0.1:8000/docs** to test the API in your browser.

### Step 5: Point the frontend to your local backend

Open `frontend/script.js` and make sure the `API_URL` line near the top is:

```
const API_URL = "http://127.0.0.1:8000/predict";
```

### Step 6: Start the frontend

Open a **second terminal**, then:

```bash
cd frontend
python -m http.server 5500
```

Open **http://127.0.0.1:5500** in your browser, fill in the form, and click **Submit Prediction**. 🎉

> 💡 You can also open `frontend/index.html` directly in a browser, but running it through a local server as above is more reliable.

---

## 🚀 Deployment on Render

The project is deployed as **two separate services** on [Render](https://render.com): the backend as a **Web Service** and the frontend as a **Static Site**.

### Part 1: Deploy the backend (Web Service)

1. Push your code to GitHub.
2. In Render, click **New +** and choose **Web Service**.
3. Connect your GitHub repository.
4. Use these settings:

| Setting | Value |
|---|---|
| **Runtime** | Python 3 |
| **Root Directory** | *(leave empty, the project root)* |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | Free |

5. Click **Create Web Service** and wait for the build to finish.
6. Copy your backend URL (for example `https://your-backend.onrender.com`).
7. Open `<your-backend-url>/docs` to confirm the API is live.

### Part 2: Connect the frontend to the deployed backend

Before deploying the frontend, open `frontend/script.js` and change `API_URL` to your live backend:

```
const API_URL = "https://student-mental-health-score-predictor-equr.onrender.com/predict";
```

Commit and push this change to GitHub.

### Part 3: Deploy the frontend (Static Site)

1. In Render, click **New +** and choose **Static Site**.
2. Connect the same GitHub repository.
3. Use these settings:

| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Build Command** | *(leave empty)* |
| **Publish Directory** | `.` |

4. Click **Create Static Site**.
5. Render gives you the live website URL.

### Part 4: Allow the frontend to call the backend

The backend must allow requests from your frontend's domain (CORS). Make sure the backend's CORS settings permit your frontend URL, or all origins during development. If this is missing, the browser blocks the request and the website shows a connection error.

### Updating after changes

Render redeploys automatically every time you push to the connected GitHub branch.

---

## 🔌 API Reference

### `POST /predict`

Returns the predicted mental health score for one student.

**Request body**

```json
{
  "age": 22,
  "gender": "Female",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 5.5,
  "daily_unlocks": 60,
  "study_hours": 4,
  "physical_activity_hours": 1,
  "sleep_hours_per_night": 7,
  "stress_level": "Medium"
}
```

**Response**

```json
{
  "predicted_mental_score": 7.5
}
```

### Allowed values (capitalization must match exactly)

| Field | Values |
|---|---|
| `gender` | Male, Female |
| `country` | India, USA, Canada, Australia, UK, Germany, Mexico, Turkey, France, Other |
| `academic_level` | Undergraduate, Graduate, High School |
| `most_used_platform` | Facebook, LinkedIn, Instagram, Snapchat, Twitter, YouTube, TikTok, LINE, KakaoTalk, VKontakte, WhatsApp, WeChat |
| `purpose_of_use` | Networking, Education, Entertainment, News |
| `stress_level` | Low, Medium, High, Very High |

### Number limits

| Field | Allowed range |
|---|---|
| `age` | 10 to 100 (whole number) |
| `study_hours`, `avg_daily_usage_hours`, `physical_activity_hours`, `sleep_hours_per_night` | 0 to 24 |
| `daily_unlocks` | 0 or more (whole number) |

---

## 🧰 Troubleshooting

| Problem | Solution |
|---|---|
| Website says it can't reach the server | The free Render backend may be waking up. Wait about a minute and retry. Also check that `API_URL` in `frontend/script.js` points to the correct backend. |
| Browser console shows a **CORS** error | The backend must allow your frontend's domain. Update the backend CORS settings and redeploy. |
| `422 Unprocessable Entity` | A field name, value, or capitalization doesn't match the allowed values above. |
| Backend build fails on Render | Check that `requirements.txt` lists every package, with versions matching those used to train the model. |
| Model fails to load | The scikit-learn (or other library) version differs from the one used for training. Pin the training versions. |
| Changes don't appear online | Make sure you pushed to GitHub, then wait for Render to finish redeploying. |

## 🔮 Future Improvements

- Show model evaluation metrics (MAE, RMSE, R²) in the app
- Scale the result ring to the model's real score range
- Add feature-importance charts
- Add a Docker setup
- Add automated tests

---

<p align="center">Built with FastAPI, machine learning, and clean UI. ✨</p>
