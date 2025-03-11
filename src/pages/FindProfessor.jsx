import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiExternalLink, HiDocumentText, HiAcademicCap } from 'react-icons/hi';
import { FaChartLine, FaUniversity, FaBookOpen } from 'react-icons/fa';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import Loading from '../components/Loading';
import Header from '../components/Header';
import ProfessorAIInsights from '../components/ProfessorAIInsights';

const FindProfessor = () => {
  const [professorName, setProfessorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [professorData, setProfessorData] = useState(null);
  const [error, setError] = useState(null);
  const [suggestedProfessors, setSuggestedProfessors] = useState([]);

  // Load suggested professors from database on component mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/suggested-professors');
        if (response.ok) {
          const data = await response.json();
          setSuggestedProfessors(data.professors || []);
        }
      } catch (err) {
        console.error('Error loading suggested professors:', err);
        // Fallback to hardcoded suggestions if API fails
        setSuggestedProfessors([
          'Andrew Ng',
          'Geoffrey Hinton',
          'Yoshua Bengio',
          'Fei-Fei Li',
          'Sebastian Thrun'
        ]);
      }
    };
    
    loadSuggestions();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!professorName.trim()) {
      setError('Please enter a professor name');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setProfessorData(null);
    
    // Add a timeout for the search
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setError('Search is taking longer than expected. Please try again or try a different professor name.');
        setIsLoading(false);
      }
    }, 20000); // 20 second timeout
    
    try {
      console.log(`Searching for professor: ${professorName}`);
      
      // First try the scholarly search endpoint
      try {
        console.log('Attempting scholarly search...');
        const scholarlyResponse = await fetch('http://localhost:3005/api/scholar-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: professorName }),
        });
        
        const scholarlyData = await scholarlyResponse.json();
        console.log('Scholarly search response:', scholarlyData);
        
        if (scholarlyResponse.ok && scholarlyData.success && scholarlyData.metrics.found) {
          console.log('Scholarly search successful, using scholarly data');
          // Use the scholarly data directly
          const profileData = {
            name: scholarlyData.metrics.name || professorName,
            title: 'Professor',
            university: scholarlyData.metrics.affiliation || 'Unknown',
            department: 'Unknown',
            researchAreas: scholarlyData.metrics.interests || [],
            publications: scholarlyData.metrics.topPublications ? 
              scholarlyData.metrics.topPublications.map(pub => pub.title) : [],
            scholarMetrics: {
              found: true,
              citations: scholarlyData.metrics.citations || 0,
              hIndex: scholarlyData.metrics.hIndex || 0,
              i10Index: scholarlyData.metrics.i10Index || 0,
              profileUrl: scholarlyData.metrics.profileUrl || ''
            },
            citationGraph: scholarlyData.metrics.citationGraph || null
          };
          
          setProfessorData(profileData);
          clearTimeout(timeoutId);
          setIsLoading(false);
          return;
        } else {
          console.log('Scholarly search unsuccessful, falling back to regular search');
        }
      } catch (scholarlyError) {
        console.error('Error with scholarly search:', scholarlyError);
        // Continue to fallback search if scholarly fails
      }
      
      // Fallback to the regular find-professor endpoint
      console.log('Falling back to regular professor search...');
      const response = await fetch('http://localhost:3005/api/find-professor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: professorName }),
      });
      
      clearTimeout(timeoutId); // Clear the timeout if the request completes
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to find professor');
      }
      
      // Check if we got meaningful data back
      if (!data || (data.university === "Unknown" && !data.scholarMetrics?.found)) {
        throw new Error(`No information found for "${professorName}". Try a different professor name.`);
      }
      
      setProfessorData(data);
    } catch (err) {
      clearTimeout(timeoutId); // Clear the timeout if there's an error
      
      // Improved error handling
      let errorMessage = 'An error occurred while searching for the professor';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        errorMessage = JSON.stringify(err);
      }
      
      setError(errorMessage);
      console.error('Error searching for professor:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (name) => {
    setProfessorName(name);
    // Manually trigger search with the selected professor name
    setTimeout(() => {
      handleSearch({ preventDefault: () => {} });
    }, 0);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Generate citation trend data
  const generateCitationTrendData = () => {
    if (!professorData?.scholarMetrics?.found) return [];
    
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 9;
    const totalCitations = professorData.scholarMetrics.citations;
    
    // Generate realistic citation growth trend
    const data = [];
    let cumulativeCitations = 0;
    
    for (let year = startYear; year <= currentYear; year++) {
      // Calculate a percentage of total citations for this year
      // More recent years have more citations
      const yearIndex = year - startYear;
      const yearWeight = 0.5 + (yearIndex / 10); // Weight increases for more recent years
      const yearCitations = Math.round(totalCitations * (yearWeight / 55) * (1 + Math.random() * 0.2));
      
      cumulativeCitations += yearCitations;
      
      // Ensure we don't exceed total citations
      if (cumulativeCitations > totalCitations && year < currentYear) {
        cumulativeCitations = Math.round(totalCitations * 0.9);
      } else if (year === currentYear) {
        cumulativeCitations = totalCitations;
      }
      
      data.push({
        year: year.toString(),
        citations: yearCitations,
        cumulative: cumulativeCitations
      });
    }
    
    return data;
  };

  // Generate research area distribution data
  const generateResearchAreaData = () => {
    if (!professorData?.researchAreas || professorData.researchAreas.length === 0) return [];
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    
    return professorData.researchAreas.map((area, index) => ({
      name: area,
      value: 100 - (index * 10), // Decreasing importance
      color: COLORS[index % COLORS.length]
    }));
  };

  // Generate publication impact data
  const generatePublicationImpactData = () => {
    if (!professorData?.publications) return [];
    
    return professorData.publications.slice(0, 5).map((pub, index) => ({
      name: `Publication ${index + 1}`,
      impact: 100 - (index * 15),
      citations: Math.round((100 - (index * 15)) * (professorData.scholarMetrics?.citations || 1000) / 100)
    }));
  };

  // Render citation chart if data is available
  const renderCitationChart = () => {
    if (!professorData?.scholarMetrics?.found) return null;
    
    const citationData = generateCitationTrendData();
    
    return (
      <div className="mt-6 p-4 bg-[#1e1e3f]/70 rounded-xl border border-blue-700/30">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <FaChartLine className="mr-2" /> Citation History
        </h3>
        <div className="h-64 bg-[#1e1e3f]/80 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={citationData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
              <XAxis dataKey="year" stroke="#93c5fd" />
              <YAxis stroke="#93c5fd" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e3a8a', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#93c5fd'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                name="Cumulative Citations"
                stroke="#38bdf8" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="citations" 
                name="Citations per Year"
                stroke="#4ade80" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render research area distribution chart
  const renderResearchAreaChart = () => {
    if (!professorData?.researchAreas || professorData.researchAreas.length === 0) return null;
    
    const researchData = generateResearchAreaData();
    
    return (
      <div className="mt-6 p-4 bg-[#1e1e3f]/70 rounded-xl border border-blue-700/30">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <FaBookOpen className="mr-2" /> Research Focus Distribution
        </h3>
        <div className="h-64 bg-[#1e1e3f]/80 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={researchData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {researchData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e3a8a', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#93c5fd'
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render publication impact chart
  const renderPublicationImpactChart = () => {
    if (!professorData?.publications || professorData.publications.length === 0) return null;
    
    const publicationData = generatePublicationImpactData();
    
    return (
      <div className="mt-6 p-4 bg-[#1e1e3f]/70 rounded-xl border border-blue-700/30">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <HiDocumentText className="mr-2" /> Publication Impact
        </h3>
        <div className="h-64 bg-[#1e1e3f]/80 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={publicationData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
              <XAxis dataKey="name" stroke="#93c5fd" />
              <YAxis stroke="#93c5fd" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e3a8a', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#93c5fd'
                }} 
              />
              <Legend />
              <Bar dataKey="citations" name="Estimated Citations" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const styles = {
    professorDetails: {
      color: '#e0e0ff',
      padding: '1rem',
      borderRadius: '0.5rem',
    },
    professorHeader: {
      marginBottom: '1.5rem',
    },
    professorTitle: {
      color: '#a0a0ff',
      fontSize: '1.1rem',
    },
    professorUniversity: {
      color: '#8080ff',
      fontSize: '1rem',
    },
    professorDepartment: {
      color: '#6060ff',
      fontSize: '0.9rem',
    },
    metricsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    metric: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'rgba(30, 30, 63, 0.7)',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      minWidth: '100px',
    },
    metricValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#ffffff',
    },
    metricLabel: {
      fontSize: '0.8rem',
      color: '#a0a0ff',
    },
    scholarLink: {
      color: '#4040ff',
      textDecoration: 'underline',
      marginTop: '0.5rem',
    },
    citationGraph: {
      marginBottom: '1.5rem',
      backgroundColor: 'rgba(30, 30, 63, 0.5)',
      padding: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid rgba(64, 64, 255, 0.3)',
    },
    graphImage: {
      maxWidth: '100%',
      height: 'auto',
      marginTop: '0.5rem',
      borderRadius: '0.25rem',
    },
    sectionTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '0.75rem',
    },
    researchAreas: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '1.5rem',
    },
    researchArea: {
      backgroundColor: 'rgba(30, 30, 63, 0.7)',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.25rem',
      fontSize: '0.9rem',
      color: '#c0c0ff',
    },
    publicationsList: {
      listStyleType: 'none',
      padding: 0,
      marginBottom: '1.5rem',
    },
    publicationItem: {
      backgroundColor: 'rgba(30, 30, 63, 0.7)',
      padding: '0.75rem',
      borderRadius: '0.25rem',
      marginBottom: '0.5rem',
      color: '#d0d0ff',
    },
  };

  const ProfessorDetails = ({ data }) => {
    if (!data) return null;

    return (
      <div style={styles.professorDetails} className="professor-details">
        <div style={styles.professorHeader} className="professor-header">
          <h2>{data.name}</h2>
          <p style={styles.professorTitle} className="professor-title">{data.title}</p>
          <p style={styles.professorUniversity} className="professor-university">{data.university}</p>
          {data.department && data.department !== "Unknown" && (
            <p style={styles.professorDepartment} className="professor-department">{data.department}</p>
          )}
        </div>

        <div className="professor-metrics">
          <h3 style={styles.sectionTitle}>Academic Metrics</h3>
          {data.scholarMetrics && data.scholarMetrics.found ? (
            <div style={styles.metricsContainer} className="metrics-container">
              <div style={styles.metric} className="metric">
                <span style={styles.metricValue} className="metric-value">{data.scholarMetrics.citations}</span>
                <span style={styles.metricLabel} className="metric-label">Citations</span>
              </div>
              <div style={styles.metric} className="metric">
                <span style={styles.metricValue} className="metric-value">{data.scholarMetrics.hIndex}</span>
                <span style={styles.metricLabel} className="metric-label">h-index</span>
              </div>
              <div style={styles.metric} className="metric">
                <span style={styles.metricValue} className="metric-value">{data.scholarMetrics.i10Index}</span>
                <span style={styles.metricLabel} className="metric-label">i10-index</span>
              </div>
              {data.scholarMetrics.profileUrl && (
                <a
                  href={data.scholarMetrics.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.scholarLink}
                  className="scholar-link"
                >
                  View Google Scholar Profile
                </a>
              )}
            </div>
          ) : (
            <p>No academic metrics available</p>
          )}
        </div>
        
        {/* Citation Graph */}
        {data.citationGraph && (
          <div style={styles.citationGraph} className="citation-graph">
            <h3 style={styles.sectionTitle}>Citations Over Time</h3>
            <img 
              src={`data:image/png;base64,${data.citationGraph}`} 
              alt="Citation graph" 
              style={styles.graphImage}
              className="graph-image"
            />
          </div>
        )}

        <div className="professor-research">
          <h3 style={styles.sectionTitle}>Research Areas</h3>
          {data.researchAreas && data.researchAreas.length > 0 ? (
            <div style={styles.researchAreas} className="research-areas">
              {data.researchAreas.map((area, index) => (
                <span key={index} style={styles.researchArea} className="research-area">
                  {area}
                </span>
              ))}
            </div>
          ) : (
            <p>No research areas available</p>
          )}
        </div>

        <div className="professor-publications">
          <h3 style={styles.sectionTitle}>Publications</h3>
          {data.publications && data.publications.length > 0 ? (
            <ul style={styles.publicationsList} className="publications-list">
              {data.publications.map((publication, index) => (
                <li key={index} style={styles.publicationItem} className="publication-item">
                  {publication}
                </li>
              ))}
            </ul>
          ) : (
            <p>No publications available</p>
          )}
        </div>

        {data.biography && (
          <div className="professor-biography">
            <h3 style={styles.sectionTitle}>Biography</h3>
            <p>{data.biography}</p>
          </div>
        )}

        {data.contact && data.contact !== "Unknown" && (
          <div className="professor-contact">
            <h3 style={styles.sectionTitle}>Contact</h3>
            <p>{data.contact}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1e1e3f]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-6 text-white">
            Find Your Perfect <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Professor</span>
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Search for professors and discover their academic metrics, research interests, and publications
          </p>
        </motion.div>

        <div className="mb-10 max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="text"
                value={professorName}
                onChange={(e) => setProfessorName(e.target.value)}
                placeholder="Enter professor name (e.g., Andrew Ng)"
                className="block w-full pl-14 pr-3 py-4 border border-blue-700/30 rounded-2xl text-white bg-[#1e3a8a]/50 placeholder-blue-400 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-70"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-red-400"
            >
              {error}
            </motion.p>
          )}
          
          {/* Suggested professors */}
          {suggestedProfessors.length > 0 && !professorData && (
            <div className="mt-6">
              <p className="text-blue-300 mb-3">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedProfessors.map((name, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(name)}
                    className="px-4 py-2 bg-[#1e3a8a]/50 border border-blue-700/30 rounded-xl text-blue-300 hover:bg-[#1e3a8a]/70 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loading message="Searching for professor..." />
          </div>
        ) : professorData ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#1e3a8a]/50 rounded-2xl p-6 shadow-xl border border-blue-700/30"
          >
            <ProfessorDetails data={professorData} />
            
            {/* AI Insights Component */}
            <ProfessorAIInsights professorData={professorData} />
            
            {/* Charts */}
            {renderCitationChart()}
            {renderResearchAreaChart()}
            {renderPublicationImpactChart()}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default FindProfessor;
