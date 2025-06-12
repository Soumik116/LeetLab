import { db } from "../libs/db.js";
import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.libs.js";

export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problemId } =
      req.body;

    const userId = req.user.id;

    //validate test cases

    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      return res.status(400).json({
        message: "Invalid or missing test cases",
      });
    }

    // 2. prepare each test cases for judge0 batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    // 3. send this batch of  submissions to judge0
    const submitResponse = await submitBatch(submissions);

    const tokens = submitResponse.map((res) => res.token);

    // 4. Poll judge0 for results of all submitted test cases
    const results = await pollBatchResults(tokens);

    console.log("results");
    console.log(results);

    // Analyze test case results
    let allPassed = true;
    const detailedResults = results.map((result, i) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_outputs[i]?.trim();
      const passed = stdout === expected_output;

      if (!passed) {
        allPassed = false;
      }

      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} kB` : undefined,
        time: result.time ? `${result.time} Sec` : undefined,
      };

      //   console.log(`Test Case #${i + 1}`);
      //   console.log(`Input ${stdin[i]}`);
      //   console.log(`Expected Output for the test case: ${expected_output}`);
      //   console.log(`Actual Output for the test case: ${stdout}`);
      //   console.log(`Matched: ${passed}`);
    });

    console.log("detailedResults");
    console.log(detailedResults);

    // store submission summary
    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode: source_code,
        language: getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResults.map((res) => res.stdout)),
        stderr: detailedResults.some((res) => res.stderr)
          ? JSON.stringify(detailedResults.map((res) => res.stderr))
          : null,
        compileOutput: detailedResults.some((res) => res.compile_output)
          ? JSON.stringify(detailedResults.map((res) => res.compile_output))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResults.some((res) => res.memory)
          ? JSON.stringify(detailedResults.map((res) => res.memory))
          : null,
        time: detailedResults.some((res) => res.time)
          ? JSON.stringify(detailedResults.map((res) => res.time))
          : null,
      },
    });

    // if all passed = true the mark problem as solved for the current user

    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    }

    // 8. save individual test case results using detailedResults

    const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));

    await db.testCaseResult.createMany({
      data: testCaseResults,
    });

    const submissionWithTestCase = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Code Executed Successfully",
      submission: submissionWithTestCase,
    });
  } catch (error) {
    console.error("Error executing code", error.message);
    return res.status(500).json({
      error: "Error While Executing Code",
    });
  }
};
