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
*   [XAMPP](https://www.apachefriends.org/index.html) installed for MySQL database.

### Step-by-step Guide

1.  **Open your terminal** and navigate to the project directory:
    ```bash
    cd solvhub-project
    ```
2.  **Set up MySQL with XAMPP**:
    *   **Start XAMPP Services**: Open the XAMPP Control Panel and start the `Apache` and `MySQL` services.
    *   **Create 'solvhub' Database**:
        *   Open your web browser and go to `http://localhost/phpmyadmin`.
        *   Click on the "New" button in the left sidebar or the "Databases" tab.
        *   Enter `solvhub` as the database name.
        *   Choose a collation (e.g., `utf8mb4_unicode_ci`) and click "Create".
    *   **Configure Database Credentials**:
        *   In your `backend` folder, create a file named `.env` if it doesn't exist.
        *   Add the following lines to the `.env` file (default XAMPP MySQL username is `root` with no password):
            ```
            DB_HOST=localhost
            DB_USER=root
            DB_PASSWORD=
            DB_NAME=solvhub
            DB_DIALECT=mysql
            JWT_SECRET=your_jwt_secret_key
            JWT_EXPIRE=30d
            ```
            *(Replace `your_jwt_secret_key` with a strong, random string)*
    *   **Troubleshooting MySQL (if needed)**: If you encounter issues starting MySQL or database errors (e.g., "Incorrect file format 'db'"), you can use the provided PowerShell script:
        1.  Close the XAMPP Control Panel.
        2.  Open PowerShell as **Administrator**.
        3.  Navigate to your project root: `cd path/to/solvhub-project`
        4.  Run the fix script: `.\fix-mysql.ps1`
            This script will attempt to fix common MySQL corruption issues by restoring clean system tables and restarting the service.
    *   **Run Sequelize Migrations (if applicable)**: If your project has database migrations defined (e.g., in `backend/migrations`), you might need to run them to create the necessary tables. (This step is not explicitly in your current project structure but is common for Sequelize projects).
        ```bash
        # Example: (You might need to install sequelize-cli globally or locally first)
        # npm install -g sequelize-cli
        # npx sequelize db:migrate
        ```

    *   **Importing Existing Data (Optional)**:
        If you have a database backup (e.g., `solvhub_backup.sql`):
        1. Go to `http://localhost/phpmyadmin`.
        2. Select the `solvhub` database.
        3. Click the **Import** tab.
        4. Choose the `.sql` file and click **Import**.

2.  **Install the necessary dependencies**:
    ```bash
    npm install
    ```
    *(The `package.json` includes `express`, `cors`, `sequelize`, `mysql2`, and `dotenv`)*
3.  **Start the server**:
    ```bash
    node backend/server.js
    node backend/server.js # Or `npm start` if you have a start script defined
    ```
    *You should see a message saying "SolvHub server running on http://localhost:3000".*
4.  **View the Application**:
    *   Open your web browser and navigate to exactly: `http://localhost:3000`
    *   Alternatively, you can open `frontend/index.html` directly in your browser. The mock API allows for some basic functionality even if the Node server isn't running perfectly, but running it via Node is recommended.

## How to Share Your Database
To share your current database records with someone else:
1. Open **phpMyAdmin** and select the `solvhub` database.
2. Click **Export** -> **Go**.
3. Save the `.sql` file in the project directory.
4. When sharing the folder, tell the recipient to **Import** this file into their local MySQL.

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
