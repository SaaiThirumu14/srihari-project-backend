const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

function initGemini() {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.warn('⚠️  GEMINI_API_KEY not set. AI features will use fallback responses.');
        return false;
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✅ Gemini 2.5 AI Service initialized');
    return true;
}

async function generateContent(prompt) {
    if (!model) {
        return null;
    }
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        return null;
    }
}

// ──────────────────────────────────────────────
// AI Feature Functions
// ──────────────────────────────────────────────

/**
 * Analyze wellness notes for sentiment and provide advice
 */
async function analyzeWellness(notes, mood, stressLevel) {
    const prompt = `You are an employee wellness AI advisor. Analyze the following wellness check-in and provide a brief, supportive response (2-3 sentences max).

Employee mood: ${mood}
Stress level: ${stressLevel}/5
Notes: "${notes}"

Provide:
1. Sentiment (POSITIVE, NEUTRAL, or NEGATIVE)
2. Confidence (0.0-1.0)
3. Brief supportive advice

Respond in JSON format only: {"sentiment": "...", "confidence": 0.0, "advice": "...", "nutritionRecommendation": "Suggest 2 specific light/healthy foods that help with this mood"} (choose from Common Menu Items like 'Caesar Salad', 'Idli Sambhar', 'Veg Biryani', 'Fresh Juice', 'Sprouts')`;

    const text = await generateContent(prompt);
    if (!text) {
        return { sentiment: 'Neutral', confidence: 0.5, advice: 'Take care of yourself today!', nutritionRecommendation: 'Fresh Juice and Salad' };
    }

    try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return { sentiment: 'Neutral', confidence: 0.5, advice: text.substring(0, 200), nutritionRecommendation: 'Fresh fruits' };
    }
}

/**
 * Generate enhanced retention strategies using Gemini
 */
async function generateRetentionInsight(surveyData, ensembleResult) {
    const prompt = `You are an HR AI strategist analyzing employee churn risk. Based on the following data, provide a concise strategic insight (3-4 sentences).

Employee: ${surveyData.employeeName}, Department: ${surveyData.department}
Years at company: ${surveyData.yearsAtCompany}, Age: ${surveyData.age}
Ensemble Risk Score: ${ensembleResult.ensembleScore}/100
Prediction: ${ensembleResult.prediction} (${ensembleResult.riskLevel} risk)
Key weak areas: ${ensembleResult.keyRiskFactors.join(', ')}
Top retention strategies already suggested: ${ensembleResult.retentionStrategies.slice(0, 3).join('; ')}

Provide a personalized executive summary insight for HR to act on immediately. Be specific and actionable.`;

    const text = await generateContent(prompt);
    return text || 'AI insight unavailable. Review the ensemble metrics and retention strategies above.';
}

/**
 * AI Chatbot for HR queries
 */
async function chatWithAI(query, context = {}) {
    const prompt = `You are WorkspaceAI, an intelligent HR assistant for the company. Answer the following HR query concisely and professionally (3-5 sentences max).

Context: The company has departments including Frontend, Backend, DevOps, Data Science, Design, QA, and Product Management. Standard leave policy is 20 days/year. Work hours are 9 AM to 6 PM.

${context.role ? `User role: ${context.role}` : ''}
${context.department ? `User department: ${context.department}` : ''}

User query: "${query}"

Respond helpfully and concisely.`;

    const text = await generateContent(prompt);
    return text || 'I can help you with attendance, leave policies, performance metrics, and wellness programs. Please try rephrasing your question.';
}

/**
 * Predict absenteeism for an employee
 */
async function predictAbsenteeism(attendanceRecords, leaveRecords, employeeName) {
    const totalDays = attendanceRecords.length || 1;
    const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
    const attendanceRate = ((presentDays / totalDays) * 100).toFixed(1);
    const recentLeaves = leaveRecords.length;

    const prompt = `You are an absenteeism prediction AI. Analyze this employee's patterns and predict absence risk for the next 7 days.

Employee: ${employeeName}
Attendance rate: ${attendanceRate}%
Total records: ${totalDays}
Recent leave requests: ${recentLeaves}
Current day: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}

Respond in JSON only: {"absenceProbability": 0.0-1.0, "riskFactors": ["factor1", "factor2"], "recommendation": "brief advice"}`;

    const text = await generateContent(prompt);
    if (!text) {
        const prob = recentLeaves > 2 ? 0.6 : parseFloat(attendanceRate) < 80 ? 0.5 : 0.15;
        return { absenceProbability: prob, riskFactors: ['Insufficient data'], recommendation: 'Continue monitoring' };
    }

    try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return { absenceProbability: 0.3, riskFactors: ['Analysis pending'], recommendation: text.substring(0, 200) };
    }
}

/**
 * Workforce forecast for a department
 */
async function forecastWorkforce(department, historicalData) {
    const prompt = `You are a workforce forecasting AI. Predict attendance for the ${department} department for the next 7 days.

Historical overview: ${historicalData || 'Average attendance around 88-93%, lower on Fridays.'}

Respond in JSON only: {"forecast": [{"day": "Mon", "predictedAttendance": 92.5}, {"day": "Tue", "predictedAttendance": 93.0}, {"day": "Wed", "predictedAttendance": 94.0}, {"day": "Thu", "predictedAttendance": 91.5}, {"day": "Fri", "predictedAttendance": 86.0}, {"day": "Sat", "predictedAttendance": 0}, {"day": "Sun", "predictedAttendance": 0}], "insight": "brief summary"}`;

    const text = await generateContent(prompt);
    if (!text) {
        return {
            forecast: [
                { day: 'Mon', predictedAttendance: 92 }, { day: 'Tue', predictedAttendance: 93 },
                { day: 'Wed', predictedAttendance: 94 }, { day: 'Thu', predictedAttendance: 91 },
                { day: 'Fri', predictedAttendance: 86 }, { day: 'Sat', predictedAttendance: 0 },
                { day: 'Sun', predictedAttendance: 0 }
            ],
            insight: 'Standard forecast pattern. Friday attendance typically dips.'
        };
    }

    try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return { forecast: [], insight: text.substring(0, 300) };
    }
}

/**
 * Detect attendance anomalies
 */
async function detectAnomaly(checkInTime, employeeName) {
    const hour = new Date(checkInTime).getHours();
    if (hour >= 7 && hour <= 11) {
        return { isAnomaly: false, reason: '', score: 0.95 };
    }

    const prompt = `An employee "${employeeName}" checked in at ${new Date(checkInTime).toLocaleTimeString()}. Normal hours are 9 AM - 6 PM. Is this anomalous?

Respond in JSON only: {"isAnomaly": true/false, "reason": "brief reason", "score": 0.0-1.0}`;

    const text = await generateContent(prompt);
    if (!text) {
        const isAnomaly = hour < 6 || hour > 22;
        return { isAnomaly, reason: isAnomaly ? 'Unusual login time' : '', score: isAnomaly ? 0.4 : 0.9 };
    }

    try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return { isAnomaly: hour < 6 || hour > 22, reason: 'Unusual time', score: 0.5 };
    }
}

module.exports = {
    initGemini,
    analyzeWellness,
    generateRetentionInsight,
    chatWithAI,
    predictAbsenteeism,
    forecastWorkforce,
    detectAnomaly
};
