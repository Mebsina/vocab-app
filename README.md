# Vocabulary Learning Study Application

## Project Description

This is a React-based web application designed for a research study investigating the impact of gamification on vocabulary learning. The application guides users through a structured process including consent, pre-testing, a learning phase (either gamified or non-gamified), a motivational survey (IMI), and a post-test. All user data is securely stored in a Firebase Firestore database.

## Features

*   **Informed Consent:** Collects user consent and demographic information (native/non-native English speaker).
*   **Pre-Test:** Assesses baseline vocabulary knowledge.
*   **Gamified/Non-Gamified Learning:** Dynamically assigns users to a learning interface based on their registration order.
    *   Non-gamified users currently use FlashCards.
    *   Gamified interface is a placeholder for future development.
*   **Intrinsic Motivation Inventory (IMI):** Collects user feedback on their learning experience.
*   **Post-Test:** Measures vocabulary learning outcomes after the learning phase.
*   **Session Resume:** Allows users to continue their study session from where they left off using a unique code. The system intelligently directs them to the correct stage (Learning, Post-Test, or IMI).
*   **Unique User IDs:** Generates and ensures unique 6-character alphanumeric user IDs for each participant, which are also used as Firestore document IDs for easy data lookup.
*   **Firebase Integration:** Utilizes Google Firebase Firestore for robust and scalable data storage.

## Technology Stack

*   **Frontend:** React (JavaScript)
*   **Build Tool:** Vite
*   **Routing:** React Router DOM
*   **UI Components:** React Icons, React Quizlet Flashcard, SweetAlert2
*   **Backend:** Google Firebase Firestore

## Setup and Installation

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd vocab
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

This application connects to a Firebase Firestore backend. Your team will provide you with the necessary Firebase configuration values.

1.  **Update `.gitignore`:** Ensure your `.gitignore` file (in the project root) contains the line `.env`.
2.  **Create `.env` from `.env.example`:** In your project root (`vocab`), make a copy of the `.env.example` file and rename it to `.env`.
3.  **Populate `.env`:** Your `.env` file should contain the Firebase configuration values, each prefixed with `VITE_` as required by Vite:

    ```
    VITE_API_KEY="your_firebase_api_key"
    VITE_AUTH_DOMAIN="your_firebase_auth_domain"
    VITE_PROJECT_ID="your_firebase_project_id"
    VITE_STORAGE_BUCKET="your_firebase_storage_bucket"
    VITE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
    VITE_APP_ID="your_firebase_app_id"
    ```
    Replace the placeholder values with the actual Firebase configuration provided by your team.

4.  **`src/firebase.js`:** This file is already configured to read these environment variables.

### 4. Run the Application

```bash
npm run dev
```

This will start the development server, and your application should be accessible in your browser, connected to your Firebase project.

### 5. Upload Vocabulary Words to Firebase

To populate your Firestore database with the vocabulary words, run the provided Node.js script once:

1.  **Ensure `.env` is configured:** Make sure your `.env` file in the project root is correctly set up with your Firebase configuration.
2.  **Run the upload script:**
    ```bash
    node scripts/uploadWords.js
    ```
3.  **Verify:** After the script completes, check your Firebase console under **Firestore Database** to confirm that a new collection named `words` has been created and populated with your vocabulary words.

### 6. Deploy to Firebase Hosting

To deploy your application to Firebase Hosting:

1.  **Install Firebase CLI:** If you haven't already, install the Firebase CLI globally:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Log in to Firebase:**
    ```bash
    firebase login
    ```
3.  **Initialize Firebase in your project:** Run this command and follow the prompts:
    *   Select **Hosting** feature.
    *   Choose **Use an existing project**.
    *   Select your Firebase project.
    *   Public directory: **`dist`**
    *   Configure as a single-page app: **y**
    *   Set up GitHub Action deploys: **N**
    *   Overwrite `dist/index.html`: **N**
    ```bash
    firebase init
    ```
4.  **Build your React application:**
    ```bash
    npm run build
    ```
5.  **Deploy to Firebase Hosting:**
    ```bash
    firebase deploy
    ```
    Your live site URL will be provided in the terminal output.

## Firestore Data Structure

The application stores user data in a Firestore collection named `users`. Each document in this collection uses the generated 6-character `userID` as its Document ID.

A typical user document will have the following structure, which is incrementally updated as the user progresses through the study:

```json
{
  "userID": "ABC123",
  "consent": {
    "consentAgree": true,
    "isNativeSpeaker": false,
    "timestamp": 1678886400
  },
  "isGamified": false, 
  "preTest": {
    "testType": "Pre-Test",
    "answers": { "Word1": "DefinitionA", "Word2": "DefinitionB" },
    "score": 5,
    "total": 10,
    "percentage": 50,
    "timestamp": 1678886500
  },
  "learning": {
    "timestamp": 1678887000
  },
  "postTest": {
    "testType": "Post-Test",
    "answers": { "Word1": "DefinitionX", "Word2": "DefinitionY" },
    "score": 8,
    "total": 10,
    "percentage": 80,
    "timestamp": 1678887500
  },
  "imi": {
    "answers": { "Question1": 4, "Question2": 5 },
    "timestamp": 1678888000
  }
}
```
`isGamified`: if odd user, then `false`, if even then `true`.

## Development Notes

*   **Gamified Interface:** The gamified learning interface (`Learning.jsx`) is currently a placeholder.
*   **Security Rules:** Remember to implement robust Firebase Security Rules before deploying to production.
*   **Words Data:** The vocabulary words are fetched dynamically from the `words` collection in Firestore. 