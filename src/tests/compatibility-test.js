import { calculateCompatibilityScore } from '../utils/compatibilityScore.js';

const sampleUserProfile = {
    name: "John Doe",
    education: {
        degree: "Ph.D.",
        field: "Computer Science",
        specialization: "Machine Learning",
        university: "Stanford University",
        graduationYear: 2023
    },
    skills: [
        "Python",
        "TensorFlow",
        "Deep Learning",
        "Natural Language Processing",
        "Research Methodology"
    ],
    interests: [
        "Artificial Intelligence",
        "Neural Networks",
        "Computer Vision",
        "Data Science"
    ],
    experience: [
        {
            title: "Research Assistant",
            organization: "AI Research Lab",
            duration: "2 years",
            description: "Conducted research in deep learning and computer vision"
        }
    ],
    publications: [
        {
            title: "Novel Approaches in Deep Learning",
            year: 2022,
            journal: "Journal of Machine Learning Research"
        }
    ]
};

const sampleOpportunity = {
    title: "AI Research Scientist Position",
    organization: "Tech Research Institute",
    field: "Artificial Intelligence",
    description: "Looking for a researcher with strong background in machine learning and deep learning to work on cutting-edge AI projects.",
    requirements: [
        "Ph.D. in Computer Science or related field",
        "Experience with deep learning frameworks",
        "Strong publication record",
        "Programming skills in Python"
    ],
    preferredSkills: [
        "TensorFlow",
        "Computer Vision",
        "Natural Language Processing"
    ],
    duration: "2 years",
    location: "Silicon Valley",
    type: "Full-time research position"
};

async function testCompatibilityScoring() {
    console.log('Testing compatibility scoring...\n');
    
    try {
        console.log('User Profile:', JSON.stringify(sampleUserProfile, null, 2));
        console.log('\nOpportunity:', JSON.stringify(sampleOpportunity, null, 2));
        
        console.log('\nCalculating compatibility score...\n');
        const result = await calculateCompatibilityScore(sampleUserProfile, sampleOpportunity);
        
        console.log('Results:');
        console.log('Score:', result.totalScore);
        console.log('Explanation:', result.explanation);
        
        console.log('\nMatching Points:');
        result.strengths.forEach((point, index) => {
            console.log(`${index + 1}. ${point}`);
        });
        
        console.log('\nAreas for Improvement:');
        result.improvements.forEach((area, index) => {
            console.log(`${index + 1}. ${area}`);
        });
        
        console.log('\nTest completed successfully!');
    } catch (error) {
        console.error('Error during compatibility test:', error);
    }
}

testCompatibilityScoring();
