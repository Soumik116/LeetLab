import db from "../libs/db.js";
import { getJudge0LanguageId } from "../libs/judge0.libs.js";

export const createproblem = async (req, res) => {
  // going get all the data from the request body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    referenceSolutions,
  } = req.body;

  // going check user role once again
  if (req.user.role !== "ADMIN") {
    res.status(403).json({
      error: "You are not allowed to create a problem",
    });
  }

  // loop through each referance solution for different languages

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!language) {
        res.status(400).json({
          error: `Language ${language} is not supported`,
        });
      }

      const submissions = testCases.map(([input, output]) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdIn: input,
        expected_output: output,
      }));

      const submissionsResults = await submissionsBatch(submissions);
    }
  } catch (error) {}
};

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblem = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllSolvedProblemsByUser = async (req, res) => {};
