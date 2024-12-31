// Dummy data generator for PhD opportunities analysis
export const generateDummyAnalysis = (opportunity) => {
  // Generate a random score between 70 and 100
  const score = Math.floor(Math.random() * 31) + 70;
  
  const strengths = [
    'Strong research focus',
    'Well-funded project',
    'Reputable university',
    'Experienced supervision team',
    'International collaboration opportunities',
    'State-of-the-art facilities',
    'Industry partnerships'
  ];

  const considerations = [
    'Competitive application process',
    'High living costs in the area',
    'Intensive workload',
    'Teaching responsibilities',
    'Publication requirements'
  ];

  // Randomly select 2-3 strengths and 1-2 considerations
  const selectedStrengths = strengths
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 2) + 2);

  const selectedConsiderations = considerations
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 2) + 1);

  return {
    score,
    explanation: `This opportunity has a compatibility score of ${score}/100 based on the project scope, funding, and university reputation.`,
    strengths: selectedStrengths,
    considerations: selectedConsiderations
  };
};

// Generate dummy compatibility score
export const calculateDummyCompatibility = (userProfile, opportunity) => {
  try {
    // Generate base score between 60 and 90
    let score = Math.floor(Math.random() * 31) + 60;

    // Adjust score based on funding
    if (opportunity.fullyFunded) {
      score += 10;
    }

    // Adjust score based on university reputation
    const topUniversities = ['oxford', 'cambridge', 'harvard', 'mit', 'stanford'];
    if (topUniversities.some(uni => opportunity.university.toLowerCase().includes(uni))) {
      score += 10;
    }

    // Cap score at 100
    return Math.min(100, score);
  } catch (error) {
    console.error('Error calculating dummy compatibility:', error);
    return 70; // Default fallback score
  }
};

// Generate dummy email content
export const generateDummyEmail = (professorInfo, studentInfo) => {
  const templates = [
    {
      subject: `Research Opportunity Inquiry - ${studentInfo.name}`,
      body: `Dear Professor ${professorInfo.name},

I hope this email finds you well. My name is ${studentInfo.name}, and I am writing to express my strong interest in pursuing a PhD under your supervision at ${professorInfo.university}.

I recently completed my ${studentInfo.degree} in ${studentInfo.field} at ${studentInfo.currentInstitution}, where I focused on ${studentInfo.researchInterests.join(', ')}. Your work on ${professorInfo.researchAreas[0]} particularly interests me, and I believe it aligns well with my research goals.

I would be grateful for the opportunity to discuss potential PhD positions in your research group.

Best regards,
${studentInfo.name}`
    },
    {
      subject: `PhD Application Interest - ${studentInfo.field}`,
      body: `Dear Professor ${professorInfo.name},

I am writing to inquire about PhD opportunities in your research group at ${professorInfo.university}. I am particularly interested in your work on ${professorInfo.researchAreas.join(', ')}.

I have a ${studentInfo.degree} from ${studentInfo.currentInstitution}, where I researched ${studentInfo.researchInterests[0]}. I am eager to continue my academic journey under your guidance.

Would it be possible to schedule a brief meeting to discuss potential research directions?

Kind regards,
${studentInfo.name}`
    }
  ];

  // Randomly select a template
  return templates[Math.floor(Math.random() * templates.length)];
};

// Generate dummy research fit analysis
export const analyzeDummyResearchFit = (professorInfo, studentInfo) => {
  const fitScore = Math.floor(Math.random() * 31) + 70; // Score between 70-100
  
  const commonInterests = professorInfo.researchAreas.filter(area => 
    studentInfo.researchInterests.some(interest => 
      interest.toLowerCase().includes(area.toLowerCase()) || 
      area.toLowerCase().includes(interest.toLowerCase())
    )
  );

  return {
    score: fitScore,
    commonInterests,
    recommendations: [
      'Focus on highlighting shared research interests',
      'Mention relevant technical skills',
      'Discuss potential research directions'
    ],
    potentialChallenges: [
      'Consider time zone differences for communication',
      'Plan for potential funding requirements'
    ]
  };
};
