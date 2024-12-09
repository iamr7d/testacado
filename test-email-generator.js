import axios from 'axios';

const testEmailGenerator = async () => {
  try {
    const response = await axios.post('http://localhost:3002/api/generate-email', {
      professorUrl: 'https://www.k-state.edu/psych/about/people/loschky/',
      userProfile: {
        research_interests: [
          'Vision Science',
          'Eye Tracking',
          'Cognitive Psychology',
          'Human Perception',
          'Visual Attention'
        ],
        education: 'MS in Psychology with focus on Cognitive Science',
        experience: '2 years research experience in eye-tracking and visual perception studies',
        publications: [
          'Visual attention in natural scenes: A computational model',
          'Eye movement patterns in complex visual tasks'
        ]
      }
    });

    console.log('Professor Profile:', JSON.stringify(response.data.professorProfile, null, 2));
    console.log('\nCompatibility Score:', response.data.compatibilityScore);
    console.log('\nGenerated Email:', response.data.generatedEmail);
    console.log('\nDebug Info:', JSON.stringify(response.data.debug, null, 2));

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

testEmailGenerator();
