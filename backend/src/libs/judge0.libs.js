import axios from "axios";
export const getJudge0LanguageId = (language) => {
  const languageMap = {
    "PYTHON":71,
    "JAVA":62,
    "JAVASCRIPT":63,
  };
  return languageMap[language.toUpperCase()];
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const pollBatchResults = async (tokens)=>{
  // console.log("Polling for results")
  console.log(tokens)
    while(true){
        
        const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`,{
            params:{
                tokens:tokens.join(","),
                base64_encoded:false,
            }
        })

        const results = data.submissions;

        const isAllDone = results.every(
            (r)=> r.status.id !== 1 && r.status.id !== 2
        )

        if(isAllDone) return results
        await sleep(1000)
    }
}

export const submitBatch = async (submissions) => {
  // console.log("Submitting batch")
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    {
      submissions
    }
  );

  console.log("Submission Results: ", data);
  return data; // {token, token, token}
};


export function getLanguageName(languageId){
  const LANGUAGE_NAMES = {
    "71":"PYTHON",
    "62":"JAVA",
    "63":"JAVASCRIPT",
    "74":"TYPESCRIPT",
  };
  return LANGUAGE_NAMES[languageId] || "UNKNOWN";
}
