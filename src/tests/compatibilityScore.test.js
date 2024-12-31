import { calculateCompatibilityScore } from '../utils/compatibilityScore';

// Sample user profile
const sampleProfile = {
  personalInfo: {
    position: "PhD Researcher",
    institution: "MIT"
  },
  academic: {
    degree: "Ph.D.",
    field: "Computer Science"
  },
  research: {
    field: "Machine Learning",
    interests: ["Deep Learning", "Computer Vision", "Natural Language Processing"],
    keywords: ["AI", "Neural Networks", "Deep Learning"]
  },
  skills: {
    programmingLanguages: [
      { name: "Python" },
      { name: "JavaScript" },
      { name: "C++" }
    ],
    frameworks: [
      { name: "TensorFlow" },
      { name: "PyTorch" },
      { name: "React" }
    ],
    tools: [
      { name: "Git" },
      { name: "Docker" },
      { name: "VS Code" }
    ]
  },
  location: {
    current: "Boston, MA",
    workLocation: "Hybrid",
    timezone: "EST"
  },
  availability: {
    status: "Available",
    noticeRequired: true,
    noticePeriod: "1 month"
  }
};

// Sample opportunity
const sampleOpportunity = {
  title: "Machine Learning Research Position",
  type: "Research",
  description: "Looking for a PhD researcher with strong background in deep learning and computer vision. The project involves developing novel neural network architectures for visual recognition tasks.",
  requirements: "PhD in Computer Science or related field, experience with deep learning frameworks, strong programming skills.",
  skills: ["Python", "TensorFlow", "PyTorch", "Computer Vision"],
  location: "Boston, MA",
  workType: "Hybrid"
};

async function runTest() {
  console.log("Running compatibility score test...");
  
  try {
    const score = await calculateCompatibilityScore(sampleProfile, sampleOpportunity);
    console.log("\nCompatibility Score Results:");
    console.log("==========================");
    console.log(`Total Score: ${score.totalScore}%\n`);
    console.log("Breakdown:");
    console.log(`- Research Alignment: ${score.breakdown.researchAlignment}/40`);
    console.log(`- Skills Match: ${score.breakdown.skillsMatch}/30`);
    console.log(`- Experience Match: ${score.breakdown.experienceMatch}/20`);
    console.log(`- Location Match: ${score.breakdown.locationMatch}/10\n`);
    console.log("Explanation:");
    console.log(score.explanation);
    console.log("\nRecommendations:");
    score.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTest();
