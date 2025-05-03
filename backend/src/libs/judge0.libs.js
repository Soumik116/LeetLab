export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVASCRIPT: 63,
    JAVA: 62,
  };
  return laanguageMap[language.toUpperCase()];
};
