import { getGroqCompletion } from './groqService';

// Calculate detailed compatibility scores between SOP and opportunity
export const calculateCompatibility = async (sop, opportunity) => {
    try {
        const prompt = `
            Analyze the compatibility between a student's Statement of Purpose (SOP) and a PhD opportunity.
            Provide detailed scoring in multiple categories and an overall match percentage.
            
            Categories to analyze:
            1. Research Alignment (40%):
               - Topic relevance
               - Methodology match
               - Research goals alignment
            
            2. Technical Skills (25%):
               - Required skills mentioned in SOP
               - Programming/tools proficiency
               - Technical background match
            
            3. Academic Background (20%):
               - Educational qualifications
               - Relevant coursework
               - Academic achievements
            
            4. Experience Match (15%):
               - Research experience
               - Project work
               - Publications/presentations
            
            SOP:
            ${sop}
            
            Opportunity:
            Title: ${opportunity.title}
            Description: ${opportunity.description}
            Department: ${opportunity.department}
            University: ${opportunity.university}
            Supervisor: ${opportunity.supervisor}
            
            Provide a detailed analysis in JSON format:
            {
                "overall_score": number,
                "categories": {
                    "research_alignment": {
                        "score": number,
                        "details": [
                            {"strength": string, "score": number},
                            {"weakness": string, "score": number}
                        ]
                    },
                    "technical_skills": {
                        "score": number,
                        "details": [
                            {"strength": string, "score": number},
                            {"weakness": string, "score": number}
                        ]
                    },
                    "academic_background": {
                        "score": number,
                        "details": [
                            {"strength": string, "score": number},
                            {"weakness": string, "score": number}
                        ]
                    },
                    "experience_match": {
                        "score": number,
                        "details": [
                            {"strength": string, "score": number},
                            {"weakness": string, "score": number}
                        ]
                    }
                },
                "key_matches": [string],
                "improvement_suggestions": [string]
            }
        `;

        const response = await getGroqCompletion(prompt);
        
        try {
            const result = JSON.parse(response);
            return {
                score: result.overall_score,
                categories: result.categories,
                keyMatches: result.key_matches,
                improvements: result.improvement_suggestions
            };
        } catch (error) {
            console.error('Error parsing compatibility analysis:', error);
            return {
                score: 0,
                categories: {},
                keyMatches: [],
                improvements: ['Error analyzing compatibility']
            };
        }
    } catch (error) {
        console.error('Error calculating compatibility:', error);
        return {
            score: 0,
            categories: {},
            keyMatches: [],
            improvements: ['Error analyzing compatibility']
        };
    }
};

// Batch calculate compatibility scores for multiple opportunities
export const batchCalculateCompatibility = async (sop, opportunities) => {
    const results = await Promise.all(
        opportunities.map(opportunity => calculateCompatibility(sop, opportunity))
    );
    
    return opportunities.map((opportunity, index) => ({
        ...opportunity,
        compatibility: results[index]
    }));
};
