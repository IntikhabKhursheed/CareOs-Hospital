const Groq = require('groq-sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const parseJson = (text) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    return null;
  }
};

const createCompletion = async (messages) => {
  const completion = await client.chat.completions.create({
    model,
    messages
  });
  return completion?.choices?.[0]?.message?.content || '';
};

const generateClinicalNote = async (chiefComplaint, symptoms, vitalSigns, patientHistory) => {
  const prompt = `Generate a complete SOAP note in professional clinical format based on the following information. Return the note in plain text with sections labeled Subjective, Objective, Assessment, and Plan.\n\nChief complaint: ${chiefComplaint}\nSymptoms: ${symptoms}\nVital signs: ${JSON.stringify(vitalSigns)}\nPatient history: ${patientHistory}`;
  const text = await createCompletion([
    { role: 'system', content: 'You are a hospital medical AI assistant that writes concise SOAP notes.' },
    { role: 'user', content: prompt }
  ]);
  return text;
};

const suggestDiagnosis = async (symptoms, vitalSigns, patientAge, patientGender, conditions) => {
  const prompt = `Review the following clinical data and provide a JSON object with differentialDiagnosis, recommendedTests, and urgencyLevel. \nSymptoms: ${symptoms}\nVital signs: ${JSON.stringify(vitalSigns)}\nPatient age: ${patientAge}\nPatient gender: ${patientGender}\nMedical conditions: ${conditions}`;
  const text = await createCompletion([
    { role: 'system', content: 'You are a clinical decision support assistant. Provide structured JSON output.' },
    { role: 'user', content: prompt }
  ]);
  return parseJson(text) || { differentialDiagnosis: [], recommendedTests: [], urgencyLevel: 'moderate' };
};

const checkDrugInteraction = async (medicines) => {
  const prompt = `Analyze the following list of medicines for interactions. Return JSON with interactions, severity, and recommendations.\nMedicines: ${JSON.stringify(medicines)}`;
  const text = await createCompletion([
    { role: 'system', content: 'You are a pharmacist assistant that evaluates drug interactions.' },
    { role: 'user', content: prompt }
  ]);
  return parseJson(text) || { interactions: [], severity: 'unknown', recommendations: [] };
};

const interpretLabResults = async (testName, results, patientAge, patientGender, history) => {
  const prompt = `Interpret the lab results and return JSON with interpretation, clinicalSignificance, recommendations, and urgencyFlag.\nTest: ${testName}\nResults: ${JSON.stringify(results)}\nAge: ${patientAge}\nGender: ${patientGender}\nHistory: ${history}`;
  const text = await createCompletion([
    { role: 'system', content: 'You are a lab medicine expert. Provide clear structured analysis of lab results.' },
    { role: 'user', content: prompt }
  ]);
  return parseJson(text) || { interpretation: '', clinicalSignificance: '', recommendations: [], urgencyFlag: 'normal' };
};

const generateDischargeSummary = async (admissionDetails, diagnosis, procedures, medications) => {
  const prompt = `Write a complete discharge summary using the provided clinical details. Include admission details, diagnosis, procedures, medications, and discharge plan.\nAdmission details: ${admissionDetails}\nDiagnosis: ${diagnosis}\nProcedures: ${procedures}\nMedications: ${JSON.stringify(medications)}`;
  const text = await createCompletion([
    { role: 'system', content: 'You are a concise medical discharge summary writer.' },
    { role: 'user', content: prompt }
  ]);
  return text;
};

const identifyFollowUps = async (patients) => {
  const prompt = `Identify overdue follow-up patients and craft an outreach message. Return JSON with overduePatients and outreachMessage.\nPatients: ${JSON.stringify(patients)}`;
  const text = await createCompletion([
    { role: 'system', content: 'You are a care coordination AI that identifies overdue follow-ups.' },
    { role: 'user', content: prompt }
  ]);
  return parseJson(text) || { overduePatients: [], outreachMessage: '' };
};

const detectBillingAnomaly = async (visitDetails, billedItems) => {
  const prompt = `Detect billing anomalies and unbilled services. Return JSON with anomalies, unbilledServices, and recommendations.\nVisit details: ${JSON.stringify(visitDetails)}\nBilled items: ${JSON.stringify(billedItems)}`;
  const text = await createCompletion([
    { role: 'system', content: 'You are a healthcare billing audit assistant.' },
    { role: 'user', content: prompt }
  ]);
  return parseJson(text) || { anomalies: [], unbilledServices: [], recommendations: [] };
};

const generateWeeklyReport = async (weeklyStats) => {
  const prompt = `Generate an executive weekly report summarizing the following stats. Provide a polished text report.\nWeekly stats: ${JSON.stringify(weeklyStats)}`;
  const text = await createCompletion([
    { role: 'system', content: 'You are an executive healthcare operations report writer.' },
    { role: 'user', content: prompt }
  ]);
  return text;
};

module.exports = {
  generateClinicalNote,
  suggestDiagnosis,
  checkDrugInteraction,
  interpretLabResults,
  generateDischargeSummary,
  identifyFollowUps,
  detectBillingAnomaly,
  generateWeeklyReport
};
