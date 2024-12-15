import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiMail, HiClipboardCopy, HiCheck } from 'react-icons/hi';

const EmailGenerator = () => {
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    program: '',
    professor: '',
    research: '',
    experience: ''
  });
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your email generation logic here
    const emailTemplate = `Dear Professor ${formData.professor},

I hope this email finds you well. My name is ${formData.name}, and I am writing to express my interest in pursuing a PhD under your supervision at ${formData.university} in the ${formData.program} program.

I am particularly interested in your research on ${formData.research}. My background includes ${formData.experience}, which I believe aligns well with your research interests.

I would greatly appreciate the opportunity to discuss potential PhD opportunities in your research group.

Thank you for your time and consideration.

Best regards,
${formData.name}`;

    setGeneratedEmail(emailTemplate);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#58CC02] text-gray-900";

  return (
    <div className="min-h-screen bg-[#235390] py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-[#58CC02] p-3 rounded-2xl mb-4"
          >
            <HiMail className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Email Generator
          </h1>
          <p className="text-white/80">
            Create professional emails to reach out to potential PhD supervisors
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">University</label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="University of Example"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Program</label>
              <input
                type="text"
                name="program"
                value={formData.program}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="Computer Science"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Professor's Name</label>
              <input
                type="text"
                name="professor"
                value={formData.professor}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="Dr. Jane Smith"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Research Interest</label>
              <input
                type="text"
                name="research"
                value={formData.research}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="Artificial Intelligence and Machine Learning"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Relevant Experience</label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className={inputClasses}
                rows="4"
                placeholder="Briefly describe your relevant experience and achievements"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-[#58CC02] text-white font-bold rounded-xl hover:bg-[#46a302] transition-colors duration-300 shadow-lg shadow-[#58CC02]/20"
            >
              Generate Email
            </motion.button>
          </form>
        </motion.div>

        {/* Generated Email */}
        {generatedEmail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Generated Email</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                {copied ? (
                  <>
                    <HiCheck className="w-5 h-5 text-[#58CC02]" />
                    <span className="text-gray-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <HiClipboardCopy className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Copy</span>
                  </>
                )}
              </motion.button>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-4 rounded-xl">
              {generatedEmail}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmailGenerator;
