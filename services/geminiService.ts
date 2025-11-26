import { GoogleGenAI } from "@google/genai";
import { PluginConfig } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found in environment");
  return new GoogleGenAI({ apiKey });
};

export const generateKotlinProvider = async (config: PluginConfig): Promise<string> => {
  const ai = getAiClient();
  
  const prompt = `
    You are an expert Kotlin developer for the CloudStream 3 Android app.
    Generate a complete, valid Kotlin file for a CloudStream Provider.
    
    Details:
    - Site Name: ${config.pluginName}
    - Base URL: ${config.siteUrl}
    - Author: ${config.author}
    - Language: ${config.lang}
    
    Requirements:
    1. Class name should be ${config.pluginName}Provider.
    2. Inherit from MainAPI().
    3. Implement main methods: loadMainPage, load, loadLinks.
    4. Use 'app.cloudstream3.utils.ExtractorLink' and other standard CloudStream imports.
    5. Write plausible Jsoup scraping logic for a generic streaming site (checking for video tags, iframes).
    6. Include comments explaining where to adjust CSS selectors.
    7. Return ONLY the raw Kotlin code, no markdown formatting blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text || "";
    // Clean up potential markdown code blocks if the model adds them despite instructions
    text = text.replace(/^```kotlin\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
    return text;
  } catch (error) {
    console.error("Failed to generate Kotlin code:", error);
    return `// Error generating code. Please check your API Key.\n// Details: ${error}`;
  }
};
