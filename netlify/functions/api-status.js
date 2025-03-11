// Netlify serverless function to check API status
exports.handler = async function(event, context) {
  try {
    // Get the backend API URL from environment variables
    const apiUrl = process.env.BACKEND_API_URL || 'https://trainacado-api.render.com';
    
    // Check if the backend API is accessible
    let apiStatus = 'unknown';
    let apiMessage = 'Unable to determine API status';
    
    try {
      const response = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        apiStatus = 'online';
        apiMessage = 'API is online and responding';
      } else {
        apiStatus = 'error';
        apiMessage = `API returned status ${response.status}`;
      }
    } catch (error) {
      apiStatus = 'offline';
      apiMessage = 'API is not accessible';
    }
    
    // Return API status information
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      },
      body: JSON.stringify({
        status: 'success',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        api: {
          status: apiStatus,
          message: apiMessage,
          url: apiUrl
        },
        features: [
          'Professor Search',
          'AI Insights',
          'Research Compatibility',
          'Email Generation'
        ],
        version: '1.0.0'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'error',
        message: error.message
      })
    };
  }
};
