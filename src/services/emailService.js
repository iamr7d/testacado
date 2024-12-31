export const generateTemplateEmail = (studentInfo, professorInfo) => {
  const { name, research, experience, education } = studentInfo;
  
  return `Dear ${professorInfo.name},

I am ${name}, and I am writing to express my strong interest in pursuing a Ph.D. under your supervision at ${professorInfo.university}. I am particularly interested in your research on ${professorInfo.research}.

My research interests focus on ${research}. ${experience}

My educational background includes ${education}.

I would be grateful for the opportunity to discuss potential Ph.D. opportunities in your lab. Thank you for considering my inquiry.

Best regards,
${name}`;
};

export const analyzeProfessorProfile = (url) => {
  // Simple parser for professor info from URL
  // You would need to implement actual scraping logic here
  return {
    name: "Professor",
    university: "University",
    research: "research areas",
    department: "Department"
  };
};

export const analyzeResearchFit = (studentResearch, professorResearch) => {
  // Simple compatibility check
  return {
    score: 0.75,
    explanation: "Please review the professor's research areas manually to determine compatibility."
  };
};
