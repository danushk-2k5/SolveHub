# SolvHub Web Application

SolvHub is a community-driven digital platform that connects people with trusted local service providers. It empowers women, college students, retired professionals, and disabled individuals by giving them opportunities to showcase their skills and earn income.

## Features Currently Implemented

*   **Responsive Modern UI:** Built with HTML5, CSS3, and JavaScript, following startup design principles.
*   **Customer & Provider Portals:** Authentication flows for both types of users.
*   **Service Discovery:** Search and filter for local professionals based on skills and location.
*   **Booking System:** Request services and specify preferred dates/times.
*   **Provider Dashboard:** Manage service requests, accept/reject jobs.
*   **Mock Backend Integration:** Includes a functional Express server connected to MySQL via Sequelize.

## Project Structure

```
solvhub-project
│
├── frontend
│   ├── index.html        (Landing Page)
│   ├── about.html        (Mission & Vision)
│   ├── services.html     (Provider Listings)
│   ├── login.html        (Customer Login/Signup)
│   ├── register.html     (Provider Registration)
│   ├── booking.html      (Service Request Form)
│   ├── dashboard.html    (Provider Dashboard)
│   ├── contact.html      (Inquiries)
│   ├── css/style.css     (Global Styles & Theme)
│   └── js/script.js      (Simulated API/State logic)
│
├── backend
│   ├── server.js         (Express API Entry Point)
│   ├── routes/api.js     (Route definitions)
│   ├── controllers/      (Business logic & Mock data maps)
│   └── models/           (Sequelize models for MySQL)
│
├── package.json
└── README.md
```

## How to Run Locally

### Prerequisites
*   [Node.js](https://nodejs.org/) installed on your machine.
*   MongoDB Community Server installed locally, or a MongoDB Atlas connection URI.

### Step-by-step Guide

1.  **Open your terminal** and navigate to the project directory:
    ```bash
    cd solvhub-project
    ```
2.  **Configure MongoDB**:
    *   Start the local MongoDB service, or create a MongoDB Atlas cluster.
    *   Set `MONGO_URI` in `backend/.env`. The default is `mongodb://127.0.0.1:27017/solvhub`.
    *   For Atlas, use the cluster connection URI and keep credentials in `.env`, not in source control.
    *   Keep `JWT_SECRET` configured in the same file for authentication tokens.
    *   MongoDB creates the `solvhub` database and collections when the application first writes data.
    *   Existing MySQL/XAMPP data is not copied automatically; it remains untouched and requires a separate data migration.

2.  **Install the necessary dependencies**:
    ```bash
    npm install
    ```
    *(The `package.json` includes `express`, `cors`, `mongoose`, and `dotenv`)*
3.  **Start the API server**:
    ```bash
    npm start
    ```
    *The API listens on port `5000` by default and starts after it connects to MongoDB.*
4.  **Start the frontend** in a second terminal and open it in your browser:
    ```bash
    npm run client
    ```
    The frontend is served at `http://localhost:5173`.

## How to Share Your Database
Use MongoDB Database Tools (`mongodump` and `mongorestore`) or MongoDB Compass to export and import data. Do not share your `.env` file or database credentials.

**Demo Accounts (For Testing):**
*   **Customer:** `jane@example.com` / `password`
*   **Provider:** `mike@example.com` / `password`

---

## How to Deploy Online (GitHub & Vercel)

Because this application uses a Node/Express backend and static frontend files, deploying it requires separating them or deploying the Express app as a serverless function. Here is the easiest way to deploy it using **Vercel**:

### Step 1: Push Code to GitHub
1.  Initialize Git in your project folder: `git init`
2.  Add all files: `git add .`
3.  Commit changes: `git commit -m "Initial commit"`
4.  Go to [GitHub](https://github.com/), create a new repository called `solvhub`.
5.  Follow the instructions on GitHub to push your local repository up to GitHub.

### Step 2: Configure for Vercel
To make Express run properly on Vercel, you need a `vercel.json` file in your root folder. 
Create `vercel.json` with this content:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/backend/server.js" },
    { "source": "/(.*)", "destination": "/frontend/$1" }
  ]
}
```
*(Also, inside `backend/server.js`, you may need to export the app using `module.exports = app;` instead of `app.listen` for serverless environments. Look up "Deploy Express to Vercel" for exact tweaks).*

### Step 3: Deploy via Vercel Dashboard
1.  Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
2.  Click **Add New Project**.
3.  Import the `solvhub` repository you just created.
4.  Leave settings as default and click **Deploy**.
5.  Within 2 minutes, Vercel will provide you with a live URL where your site is hosted!

*(Data is persisted in MySQL via XAMPP. Configure your DB credentials in `backend/.env`)*

---

## Future Features for Improvement

To take SolvHub to the next level, the following features are recommended:

1.  **AI-Based Service Recommendations:** Use machine learning to match customers with the best providers based on past reviews, skill relevance, and precise job descriptions.
2.  **Real-Time Chat:** Integrate WebSockets (like Socket.io) to allow customers and providers to negotiate terms and discuss issues live before the professional arrives.
3.  **GPS Tracking for Technicians:** Integrate with Google Maps API to show customers exactly how far away their technician is once a job is accepted.
4.  **Secure Payment Gateway:** Implement Stripe or Razorpay to hold funds securely in escrow until the customer confirms the job is completed successfully.
5.  **Dedicated Mobile App:** Convert this responsive web app into a native mobile application via React Native or Flutter for push notifications and better field performance for providers.
