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

        // Calculate averages
        for (const groupKey in aggregatedData) {
          const group = aggregatedData[groupKey];
          if (group.count > 0) {
            group.preTestScore /= group.count;
            group.postTestScore /= group.count;
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
