import 'dotenv/config';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'node:process';

const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wordsDataPath = path.resolve(__dirname, 'words_list.json');
const wordsData = JSON.parse(readFileSync(wordsDataPath, 'utf-8'));

const uploadWords = async () => {
  console.log("Starting word upload to Firestore...");
  const wordsCollectionRef = collection(db, "words");

  for (const wordItem of wordsData) {
    try {
      // Use setDoc with the word itself as the document ID for easy lookup
      await setDoc(doc(wordsCollectionRef, wordItem.word), wordItem);
      console.log(`Uploaded word: ${wordItem.word}`);
    } catch (e) {
      console.error(`Error uploading word ${wordItem.word}:`, e);
    }
  }
  console.log("Word upload complete.");
  // Exit the script after upload
  process.exit(0);
};

uploadWords().catch(console.error);