import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLink, FaSpinner, FaMedal } from 'react-icons/fa';
import axios from 'axios';

const EmailGenerator = () => {
  const [professorUrl, setProfessorUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [professorProfile, setProfessorProfile] = useState(null);
  const [compatibilityScore, setCompatibilityScore] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [error, setError] = useState('');

  const generateEmail = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call backend API to scrape professor data and generate email
      const response = await axios.post('/api/generate-email', {
        professorUrl,
        userProfile: {
          // Get this from user profile context/state
          research_interests: ['AI', 'Machine Learning'],
          education: 'Bachelor in Computer Science',
          experience: '2 years research experience',
          publications: ['Paper 1', 'Paper 2']
        }
      });

      setProfessorProfile(response.data.professorProfile);
      setCompatibilityScore(response.data.compatibilityScore);
      setGeneratedEmail(response.data.generatedEmail);
    } catch (err) {
      setError('Failed to generate email. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Smart Email Generator
        </h1>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={professorUrl}
              onChange={(e) => setProfessorUrl(e.target.value)}
              placeholder="Enter professor's webpage URL"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={generateEmail}
              disabled={loading || !professorUrl}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaEnvelope />
                  Generate Email
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Results Section */}
        {professorProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Professor Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-2xl text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {professorProfile.name}
                  </h2>
                  <p className="text-gray-600">{professorProfile.department}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaMedal className="text-indigo-600" />
                  <span className="text-gray-700">Research Areas:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {professorProfile.researchAreas.map((area, index) => (
                    <span
                      key={index}
                      className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>

                {/* Compatibility Score */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Compatibility Score
                  </h3>
                  <div className="relative h-4 bg-gray-200 rounded-full">
                    <div
                      className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${compatibilityScore}%` }}
                    />
                  </div>
                  <p className="text-center mt-2 text-gray-600">
                    {compatibilityScore}% Match
                  </p>
                </div>
              </div>
            </div>

            {/* Generated Email Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Generated Email
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm">
                  {generatedEmail}
                </pre>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedEmail)}
                  className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                >
                  Copy to Clipboard
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                  Open in Email Client
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EmailGenerator;
