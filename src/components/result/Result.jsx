import React from "react";
import Navbar from "../Navbar";
import imiData from "../../assets/imi_questions.json";

function Result() {
  let imiCounter = 0;

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
              <td className="left">Pre-test</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className="left">Post-test</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className="left">Time on Task (seconds)</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
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
                        <td rowSpan={sectionData.questions.length}>{sectionData.section}</td>
                      )}
                      <td className="left">
                        {imiCounter}. {question}
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
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
                        <td rowSpan={sectionData.questions.length}>{sectionData.section}</td>
                      )}
                      <td className="left">
                        {imiCounter}. {question}
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
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
