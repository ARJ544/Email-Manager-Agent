# Email Manager AI Agent

Email Manager Agent — A smart automation agent that retrieves emails based on your query and allows secure deletion of selected messages using the Gmail API.

---

## Prerequisites

- Node.js ≥ 18.x  
- npm ≥ 9.x  
- Python ≥ 3.10  
- pip  

---

## Setup Instructions

### 1. Frontend Setup

1. Open a terminal and navigate to the frontend folder:

```bash
cd frontend
```

2. Create a `.env` file in the `frontend` folder and add:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

3. Install dependencies:

```bash
npm install
```

4. Start the frontend development server:

```bash
npm run dev
```

> The frontend will be available at [http://localhost:3000](http://localhost:3000)

---

### 2. Backend Setup

1. Open a new terminal and navigate to the backend folder:

```bash
cd backend
```

2. Create a `.env` file in the `backend` folder and add your configuration:

```env
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
GOOGLE_API_KEY=<your-google-api-key>
```

3. Install Python dependencies:

```bash
pip install -r requirements.txt
```

4. Start the backend server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

> The backend will be available at [http://localhost:8000](http://localhost:8000)

---


## Usage

1. (`cd backend`) Run the backend server first (`uvicorn main:app --host 0.0.0.0 --port 8000`).
2. (`cd frontend`) Then run the frontend server (`npm run dev`).
3. Open your browser at [http://localhost:3000](http://localhost:3000) to see the application in action.

---

## Notes

* Make sure your Google OAuth credentials are correctly set in the backend `.env` file.
* Ensure the ports `3000` (frontend) and `8000` (backend) are free before running the servers.
* For any frontend/backend updates, reinstall dependencies using `npm install` or `pip install -r requirements.txt` respectively.

## Project Structure

### Backend

```text
backend
└── graph
    ├── __init__.py
    └── graph.py
└── nodes
    ├── __init__.py
    └── agent_nodes.py
└── utils
    ├── __init__.py
    ├── get_list_of_emails_tool.py
    └── get_subject_and_date_tool.py
├── .env
├── auth.py
├── config_llm.py
├── main.py
└── requirements.txt
```

### Frontend

```text
frontend
└── public
    ├── file.svg
    ├── globe.svg
    ├── logo.png
    ├── next.svg
    ├── vercel.svg
    └── window.svg
└── src
    └── app
        ├── favicon.ico
        ├── globals.css
        ├── layout.tsx
        └── page.tsx
    └── components
        └── my_ui
            ├── ChatUi.tsx
            ├── EmailList.tsx
            ├── Navigation.tsx
            ├── theme-provider.tsx
            └── toggle-mode.tsx
        └── ui
            ├── button.tsx
            └── dropdown-menu.tsx
    └── lib
        └── utils.ts
```

---