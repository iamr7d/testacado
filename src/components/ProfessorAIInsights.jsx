import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Badge, Row, Col, Accordion } from 'react-bootstrap';

/**
 * Component to display AI-powered insights about a professor
 */
const ProfessorAIInsights = ({ professorData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchingScore, setMatchingScore] = useState(null);
  const [summary, setSummary] = useState(null);
  const [researchAnalysis, setResearchAnalysis] = useState(null);

  const calculateMatchingScore = async () => {
    if (!professorData) {
      setError('Professor data not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a mock student profile for demo purposes
      const studentProfile = {
        researchInterests: ['Machine Learning', 'Computer Vision', 'Natural Language Processing'],
        academicBackground: 'Computer Science',
        skills: ['Python', 'TensorFlow', 'Data Analysis'],
        publications: []
      };

      const response = await fetch('http://localhost:3005/api/ai/matching-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentProfile,
          professorData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate matching score');
      }

      setMatchingScore(data);
    } catch (err) {
      console.error('Error calculating matching score:', err);
      setError(err.message || 'Failed to calculate matching score');
    } finally {
      setLoading(false);
    }
  };

  const generateProfessorSummary = async () => {
    if (!professorData) {
      setError('Professor data not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3005/api/ai/professor-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ professorData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate professor summary');
      }

      setSummary(data.summary);
    } catch (err) {
      console.error('Error generating professor summary:', err);
      setError(err.message || 'Failed to generate professor summary');
    } finally {
      setLoading(false);
    }
  };

  const analyzeResearchTrends = async () => {
    if (!professorData || !professorData.publications || professorData.publications.length === 0) {
      setError('Professor publications not available for analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3005/api/ai/research-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ professorData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze research trends');
      }

      setResearchAnalysis(data.analysis);
    } catch (err) {
      console.error('Error analyzing research trends:', err);
      setError(err.message || 'Failed to analyze research trends');
    } finally {
      setLoading(false);
    }
  };

  // Render a score badge with appropriate color based on the score value
  const renderScoreBadge = (score) => {
    let variant = 'secondary';
    if (score >= 80) variant = 'success';
    else if (score >= 60) variant = 'primary';
    else if (score >= 40) variant = 'warning';
    else if (score < 40) variant = 'danger';

    return (
      <Badge bg={variant} className="p-2 fs-5">
        Match Score: {score}%
      </Badge>
    );
  };

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0">AI-Powered Insights</h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Accordion defaultActiveKey="0" className="mb-3">
          {/* Matching Score Section */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>Research Compatibility Analysis</Accordion.Header>
            <Accordion.Body>
              {!matchingScore && !loading && (
                <div className="text-center mb-3">
                  <p>Calculate how well this professor's research aligns with your interests.</p>
                  <Button 
                    variant="primary" 
                    onClick={calculateMatchingScore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Analyzing...
                      </>
                    ) : 'Calculate Research Compatibility'}
                  </Button>
                </div>
              )}

              {matchingScore && (
                <div>
                  <div className="d-flex justify-content-center mb-3">
                    {renderScoreBadge(matchingScore.score)}
                  </div>
                  
                  <div className="mb-3">
                    <h5>Analysis</h5>
                    <p>{matchingScore.analysis}</p>
                  </div>

                  <Row>
                    <Col md={6}>
                      <h5>Strengths</h5>
                      <ul className="ps-3">
                        {matchingScore.strengths.map((strength, index) => (
                          <li key={`strength-${index}`}>{strength}</li>
                        ))}
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h5>Challenges</h5>
                      <ul className="ps-3">
                        {matchingScore.challenges.map((challenge, index) => (
                          <li key={`challenge-${index}`}>{challenge}</li>
                        ))}
                      </ul>
                    </Col>
                  </Row>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>

          {/* Professor Summary Section */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>AI-Generated Professor Summary</Accordion.Header>
            <Accordion.Body>
              {!summary && !loading && (
                <div className="text-center mb-3">
                  <p>Generate a concise summary of this professor's research and academic standing.</p>
                  <Button 
                    variant="primary" 
                    onClick={generateProfessorSummary}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Generating...
                      </>
                    ) : 'Generate Summary'}
                  </Button>
                </div>
              )}

              {summary && (
                <div>
                  <blockquote className="blockquote">
                    <p>{summary}</p>
                  </blockquote>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>

          {/* Research Trends Analysis Section */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>Research Trends Analysis</Accordion.Header>
            <Accordion.Body>
              {!researchAnalysis && !loading && (
                <div className="text-center mb-3">
                  <p>Analyze research trends and future directions based on the professor's publications.</p>
                  <Button 
                    variant="primary" 
                    onClick={analyzeResearchTrends}
                    disabled={loading || !professorData?.publications?.length}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Analyzing...
                      </>
                    ) : 'Analyze Research Trends'}
                  </Button>
                  
                  {!professorData?.publications?.length && (
                    <div className="text-muted mt-2">
                      <small>No publications available for analysis</small>
                    </div>
                  )}
                </div>
              )}

              {researchAnalysis && (
                <div className="research-analysis">
                  <div dangerouslySetInnerHTML={{ __html: researchAnalysis.replace(/\n/g, '<br>') }} />
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default ProfessorAIInsights;
