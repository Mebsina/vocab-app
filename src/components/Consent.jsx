import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useState } from "react";
import utDallasLogo from "../assets/UT_Dallas_Wordmark_-_2_Line.svg";

function Consent({ onConsentSubmit }) {
  const navigate = useNavigate();
  const [consentAgree, setConsentAgree] = useState(false);
  const [isNative, setIsNative] = useState(null);

  const handleConsentForm = (e) => {
    e.preventDefault();

    const consentData = {
      consent: {
        consentAgree: consentAgree,
        isNativeSpeaker: isNative === "yes",
        timestamp: Math.floor(Date.now() / 1000),
      },
    };

    // pass this to App.jsx to be help temporarily
    onConsentSubmit(consentData);
    console.log("Consent Data: ", consentData);

    navigate("/pretest");
  };

  return (
    <>
      <Navbar linkSet="continuePage" />
      <main>
        <div className="center">
          {/* <img
            src={utDallasLogo}
            alt="UT Dallas Logo"
            style={{ width: "100%", maxWidth: "500px" }}
          /> */}
        </div>
        <h1 className="center">Informed Consent to Participate</h1>
        <h2>
          Study Title: <i>Gamification's Impact on Vocabulary Learning:
          <span style={{ whiteSpace: "nowrap" }}> A Comparative</span> Study of Native and Non-Native
          English Speakers</i>
        </h2>

        <h3>1. Introduction and Purpose</h3>
        <p>
          You are invited to participate in a research study about how different software designs
          affect learning. The purpose of this research is to understand how gamification affects
          motivation and persistence in vocabulary learning for native versus non-native English
          speakers.
        </p>

        <h3>2. What You Will Be Asked to Do</h3>
        <p>
          If you agree to participate, you will be asked to complete a single remote session that
          will last no longer than 60 minutes. The procedure includes the following steps:
        </p>
        <ul>
          <li>
            <strong>Consent and Pre-Questionnaire:</strong> You will first review this form. If you
            agree, you will complete a short questionnaire providing your language background data.
          </li>
          <li>
            <strong>Pre-Test:</strong> You will take a multiple-choice pre-test on 15 target
            vocabulary words to establish a baseline. Your results will not be displayed.
          </li>
          <li>
            <strong>Task Onboarding:</strong> Based on your language background, you will be
            randomly assigned to use either a "gamified" or "non-gamified" learning application. You
            will receive standardized instructions on how to use it.
          </li>
          <li>
            <strong>Learning Phase:</strong> You will study the vocabulary words at your own pace
            for a maximum of 25 minutes. The software will log your interactions and time on task.
          </li>
          <li>
            <strong>Motivation Survey:</strong> After the learning task, you will complete the
            Intrinsic Motivation Inventory (IMI) questionnaire to measure your subjective
            experience.
          </li>
          <li>
            <strong>Post-Test:</strong> You will complete a final vocabulary post-test to measure
            learning outcomes.
          </li>
          <li>
            <strong>Debriefing:</strong> Finally, you will be thanked for your time.
          </li>
        </ul>

        <h3>3. Risks and Benefits</h3>
        <p>There are no anticipated risks to you beyond those of everyday computer use.</p>
        <p>There are no direct benefits or compensation for your participation.</p>

        <h3>4. Confidentiality</h3>
        <p>
          Your privacy will be protected. All data collected (test scores, survey answers, and time
          on task) will be anonymized. Your name or other personal identifiers will not be connected
          to your results in any reports or publications. The anonymous data will be used only for
          this research.
        </p>

        <h3>5. Voluntary Participation</h3>
        <p>
          Your participation in this study is completely voluntary. You may refuse to participate or
          withdraw from the study at any point without penalty.
        </p>

        <form onSubmit={handleConsentForm}>
          <h3>Statement of Consent:</h3>
          <p>
            Please check the box below to confirm that you have read and understood this form, are
            at least 18 years old, and voluntarily agree to participate in this study.
          </p>
          <input
            type="checkbox"
            id="consent_agree"
            name="consent_agree"
            checked={consentAgree}
            onChange={(e) => setConsentAgree(e.target.checked)}
            required
          />
          <label htmlFor="consent_agree">
            I fully understand the information above and consent to participate.
          </label>
          <br />

          <h3>Are you a native English speaker?</h3>
          <div className="imi-box center">
            <input
              type="radio"
              id="native_yes"
              name="native"
              value="yes"
              checked={isNative === "yes"}
              onChange={(e) => setIsNative(e.target.value)}
              required
            />
            <label htmlFor="native_yes">Yes</label>
          </div>
          <div className="imi-box center">
            <input
              type="radio"
              id="native_no"
              name="native"
              value="no"
              checked={isNative === "no"}
              onChange={(e) => setIsNative(e.target.value)}
            />
            <label htmlFor="native_no">No</label>
          </div>
          <br />
          <br />

          <button type="submit">Start Pre-Test</button>
          <br />
        </form>
      </main>
    </>
  );
}

export default Consent;
