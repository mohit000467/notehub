// src/services/geminiService.js
// Gemini AI — Note Summarizer

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ── Generate summary from note metadata ──────────────────────
// PDF content directly read nahi ho sakta browser se freely,
// isliye note title + description + subject + tags se summary banate hain
// Ye approach 100% free hai aur koi extra library nahi chahiye

export const generateNoteSummary = async (note) => {
  try {
    const prompt = `You are an academic note summarizer for college students.

Based on the following note details, generate a helpful summary:

Title: ${note.title}
Subject: ${note.subjectDisplay || note.subject}
Description: ${note.description || "No description provided"}
Tags: ${note.tags?.join(", ") || "None"}
File Type: ${note.fileType?.toUpperCase()}

Please provide:
1. **What this note covers** (2-3 lines)
2. **Key topics** (bullet points, max 5)
3. **Best for** (which students/semester this is useful for)
4. **Quick verdict** (one line — is it worth downloading?)

Keep it concise and student-friendly. Use simple English.`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error?.message || "Gemini API error");
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No response from Gemini");

    return { success: true, summary: text };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
