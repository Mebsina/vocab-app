import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import imiData from "../../assets/imi_questions.json";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

// Initialize group's data structure
const createGroupData = () => {
  const imiAnswers = {};
  imiData.motivationalExperience.flatMap((s) => s.questions).forEach((q) => (imiAnswers[q] = 0));
  imiData.behavioralOutcome.flatMap((s) => s.questions).forEach((q) => (imiAnswers[q] = 0));

  return {
    count: 0,
    preTestScore: 0,
    postTestScore: 0,
    preTestScores: [],
    postTestScores: [],
    cohensD: 0,
    preTestTime: 0,
    timeOnTask: 0,
    postTestTime: 0,
    imiTime: 0,
    imi: imiAnswers,
  };
};

function Result() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  let imiCounter = 0;

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = querySnapshot.docs.map((doc) => doc.data());

        // Aggregate data
        const aggregatedData = {
          gamified_native: createGroupData(),
          gamified_non_native: createGroupData(),
          non_gamified_native: createGroupData(),
          non_gamified_non_native: createGroupData(),
        };

        users.forEach((user) => {
          // Skip users who haven't completed the study
          if (!user.consent || !user.preTest || !user.postTest || !user.learning || !user.imi) {
            return;
          }

          let groupKey;
          if (user.isGamified) {
            groupKey = user.consent.isNativeSpeaker ? "gamified_native" : "gamified_non_native";
          } else {
            groupKey = user.consent.isNativeSpeaker
              ? "non_gamified_native"
              : "non_gamified_non_native";
          }

          const group = aggregatedData[groupKey];
          group.count++;
          group.preTestScore += user.preTest.percentage;
          group.postTestScore += user.postTest.percentage;
          group.preTestScores.push(user.preTest.percentage);
          group.postTestScores.push(user.postTest.percentage);
          group.preTestTime += user.preTest.timestamp - user.consent.timestamp;
          group.timeOnTask += user.learning.timestamp - user.preTest.timestamp;
          group.postTestTime += user.postTest.timestamp - user.learning.timestamp;
          group.imiTime += user.imi.timestamp - user.postTest.timestamp;

          for (const question in user.imi.answers) {
            if (Object.prototype.hasOwnProperty.call(group.imi, question)) {
              group.imi[question] += user.imi.answers[question];
            }
          }
        });

        // console.log("Gamified Native Pre-Test Scores:", aggregatedData.gamified_native.preTestScores);
        // console.log("Gamified Native Post-Test Scores:", aggregatedData.gamified_native.postTestScores);
        // console.log("Gamified Non-Native Pre-Test Scores:", aggregatedData.gamified_non_native.preTestScores);
        // console.log("Gamified Non-Native Post-Test Scores:", aggregatedData.gamified_non_native.postTestScores);
        // console.log("Non-Gamified Native Pre-Test Scores:", aggregatedData.non_gamified_native.preTestScores);
        // console.log("Non-Gamified Native Post-Test Scores:", aggregatedData.non_gamified_native.postTestScores);
        // console.log("Non-Gamified Non-Native Pre-Test Scores:", aggregatedData.non_gamified_non_native.preTestScores);
        // console.log("Non-Gamified Non-Native Post-Test Scores:", aggregatedData.non_gamified_non_native.postTestScores);

        const calculateStandardDeviation = (array, mean) => {
          const n = array.length;
          if (n < 2) return 0;
          return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / (n - 1));
        };

        const calculateCohensD = (mean1, mean2, stdDev1, stdDev2, n1, n2) => {
          if (n1 < 2 || n2 < 2) return 0;
          const pooledStdDev = Math.sqrt(((n1 - 1) * Math.pow(stdDev1, 2) + (n2 - 1) * Math.pow(stdDev2, 2)) / (n1 + n2 - 2));
          if (pooledStdDev === 0) return 0;
          return (mean1 - mean2) / pooledStdDev;
        };

        // Calculate averages and Cohen's d
        for (const groupKey in aggregatedData) {
          const group = aggregatedData[groupKey];
          if (group.count > 0) {
            const meanPreTest = group.preTestScore / group.count;
            const meanPostTest = group.postTestScore / group.count;

            const stdDevPreTest = calculateStandardDeviation(group.preTestScores, meanPreTest);
            const stdDevPostTest = calculateStandardDeviation(group.postTestScores, meanPostTest);

            group.preTestScore = meanPreTest;
            group.postTestScore = meanPostTest;

            group.cohensD = calculateCohensD(meanPostTest, meanPreTest, stdDevPostTest, stdDevPreTest, group.count, group.count);

            group.preTestTime /= group.count;
            group.timeOnTask /= group.count;
            group.postTestTime /= group.count;
            group.imiTime /= group.count;
            for (const question in group.imi) {
              group.imi[question] /= group.count;
            }
          }
        }

        setResults(aggregatedData);
      } catch (error) {
        console.error("Error fetching or processing user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <main>
          <h1 className="center">Loading Results...</h1>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <h1 className="center">Results</h1>

        <h2>Assessment</h2>
        <table>
          <thead>
            <tr>
              <th rowSpan="2">Section</th>
              <th colSpan="2">Gamified</th>
              <th colSpan="2">Non-Gamified</th>
            </tr>
            <tr>
              <th>Native</th>
              <th>Non-Native</th>
              <th>Native</th>
              <th>Non-Native</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="left">Participants</td>
              <td>{results.gamified_native.count}</td>
              <td>{results.gamified_non_native.count}</td>
              <td>{results.non_gamified_native.count}</td>
              <td>{results.non_gamified_non_native.count}</td>
            </tr>
            <tr>
              <td className="left">Pre-Test Score</td>
              <td>{results.gamified_native.preTestScore.toFixed(0)}%</td>
              <td>{results.gamified_non_native.preTestScore.toFixed(0)}%</td>
              <td>{results.non_gamified_native.preTestScore.toFixed(0)}%</td>
              <td>{results.non_gamified_non_native.preTestScore.toFixed(0)}%</td>
            </tr>
            <tr>
              <td className="left">Pre-Test Time</td>
              <td>{results.gamified_native.preTestTime.toFixed(0)} s</td>
              <td>{results.gamified_non_native.preTestTime.toFixed(0)} s</td>
              <td>{results.non_gamified_native.preTestTime.toFixed(0)} s</td>
              <td>{results.non_gamified_non_native.preTestTime.toFixed(0)} s</td>
            </tr>
            <tr>
              <td className="left">Task on Time</td>
              <td>{results.gamified_native.timeOnTask.toFixed(0)} s</td>
              <td>{results.gamified_non_native.timeOnTask.toFixed(0)} s</td>
              <td>{results.non_gamified_native.timeOnTask.toFixed(0)} s</td>
              <td>{results.non_gamified_non_native.timeOnTask.toFixed(0)} s</td>
            </tr>
            <tr>
              <td className="left">Post-Test Score</td>
              <td>{results.gamified_native.postTestScore.toFixed(0)}%</td>
              <td>{results.gamified_non_native.postTestScore.toFixed(0)}%</td>
              <td>{results.non_gamified_native.postTestScore.toFixed(0)}%</td>
              <td>{results.non_gamified_non_native.postTestScore.toFixed(0)}%</td>
            </tr>
            <tr>
              <td className="left">Post-Test Time</td>
              <td>{results.gamified_native.postTestTime.toFixed(0)} s</td>
              <td>{results.gamified_non_native.postTestTime.toFixed(0)} s</td>
              <td>{results.non_gamified_native.postTestTime.toFixed(0)} s</td>
              <td>{results.non_gamified_non_native.postTestTime.toFixed(0)} s</td>
            </tr>
            <tr>
              <td className="left">Cohen's <i>d</i></td>
              <td>{results.gamified_native.cohensD.toFixed(2)}</td>
              <td>{results.gamified_non_native.cohensD.toFixed(2)}</td>
              <td>{results.non_gamified_native.cohensD.toFixed(2)}</td>
              <td>{results.non_gamified_non_native.cohensD.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="left">IMI Time</td>
              <td>{results.gamified_native.imiTime.toFixed(0)} s</td>
              <td>{results.gamified_non_native.imiTime.toFixed(0)} s</td>
              <td>{results.non_gamified_native.imiTime.toFixed(0)} s</td>
              <td>{results.non_gamified_non_native.imiTime.toFixed(0)} s</td>
            </tr>
          </tbody>
        </table>

        <h2>The Motivational Experience & The Behavioral Outcome</h2>
        <table>
          <thead>
            <tr>
              <th rowSpan="2">Section</th>
              <th rowSpan="2">Question</th>
              <th colSpan="2">Gamified</th>
              <th colSpan="2">Non-Gamified</th>
            </tr>
            <tr>
              <th>Native</th>
              <th>Non-Native</th>
              <th>Native</th>
              <th>Non-Native</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan="6" className="left">
                <strong>The Motivational Experience</strong>
              </td>
            </tr>
            {imiData.motivationalExperience.map((sectionData) => (
              <React.Fragment key={sectionData.section}>
                {sectionData.questions.map((question, index) => {
                  imiCounter++;
                  return (
                    <tr key={question}>
                      {index === 0 && (
                        <td rowSpan={sectionData.questions.length} className="left">{sectionData.section}</td>
                      )}
                      <td className="left">
                        {imiCounter}. {question}
                      </td>
                      <td>{results.gamified_native.imi[question]?.toFixed(2)}</td>
                      <td>{results.gamified_non_native.imi[question]?.toFixed(2)}</td>
                      <td>{results.non_gamified_native.imi[question]?.toFixed(2)}</td>
                      <td>{results.non_gamified_non_native.imi[question]?.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}

            <tr>
              <td colSpan="6" className="left">
                <strong>The Behavioral Outcome</strong>
              </td>
            </tr>
            {imiData.behavioralOutcome.map((sectionData) => (
              <React.Fragment key={sectionData.section}>
                {sectionData.questions.map((question, index) => {
                  imiCounter++;
                  return (
                    <tr key={question}>
                      {index === 0 && (
                        <td rowSpan={sectionData.questions.length} className="left">{sectionData.section}</td>
                      )}
                      <td className="left">
                        {imiCounter}. {question}
                      </td>
                      <td>{results.gamified_native.imi[question]?.toFixed(2)}</td>
                      <td>{results.gamified_non_native.imi[question]?.toFixed(2)}</td>
                      <td>{results.non_gamified_native.imi[question]?.toFixed(2)}</td>
                      <td>{results.non_gamified_non_native.imi[question]?.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}

export default Result;
