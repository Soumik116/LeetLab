import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.libs.js";

export const createProblem = async (req, res) => {
  // going get all the data from the request body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  // going check user role once again
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "You are not allowed to create a problem",
    });
  }

  // loop through each referance solution for different languages

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          error: `Language ${language} is not supported`,
        });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionsResults = await submitBatch(submissions);
      const token = submissionsResults.map((res) => res.token);

      const results = await pollBatchResults(token);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log("result :", result);

        // console.log(`Testcase ${i + 1} and language ${language} --- result ${JSON.stringify(result.status.description)}`);

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} faild for language ${language}`,
          });
        }
      }
    }

    // save the problem to database

    const newProblem = 
    await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Message Created Successfully",
      problem: newProblem,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Error While Creating Problem",error
    });
  }
};

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblem = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllSolvedProblemsByUser = async (req, res) => {};
