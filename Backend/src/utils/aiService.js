import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Default candidate models in case listing fails
const DEFAULT_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-pro',
  'gemini-1.0-pro'
];

/**
 * Dynamically list available models from the Google API
 */
const getAvailableModels = async () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return DEFAULT_MODELS;

    // Use fetch to list models from the v1beta endpoint (standard for listing)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.models && Array.isArray(data.models)) {
      // Filter models that support generateContent
      const supportedModels = data.models
        .filter(m => m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));

      console.log('[AI-INIT] Dynamically discovered models:', supportedModels);
      return supportedModels.length > 0 ? supportedModels : DEFAULT_MODELS;
    }
    return DEFAULT_MODELS;
  } catch (error) {
    console.error('[AI-INIT] Failed to list models, using defaults:', error.message);
    return DEFAULT_MODELS;
  }
};

/**
 * Generic function to generate content with fallback logic
 */
const generateWithFallback = async (prompt, type) => {
  const models = await getAvailableModels();
  let lastError = null;

  console.log(`[AI-START] Attempting ${type} generation...`);

  for (const modelName of models) {
    try {
      console.log(`[AI-TRY] Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text) {
        console.log(`[AI-SUCCESS] Successfully generated ${type} with: ${modelName}`);
        return text;
      }
    } catch (error) {
      console.warn(`[AI-FAIL] ${modelName} failed: ${error.message}`);
      lastError = error;
      // If the error is "API key expired", don't bother trying other models
      if (error.message.includes('API key expired') || error.message.includes('API_KEY_INVALID')) {
        console.error('[AI-FATAL] API Key is invalid or expired. Stopping retries.');
        break;
      }
    }
  }

  throw new Error(`AI generation failed for all tested models. Last error: ${lastError?.message || 'Unknown error'}`);
};

export const generateProductDescription = async (productName) => {
  const prompt = `Generate a compelling and professional product description for a product named "${productName}". The description should be suitable for an e-commerce platform and be approximately 2-3 sentences long.`;
  return await generateWithFallback(prompt, 'description');
};

export const generateProductTags = async (productName) => {
  const prompt = `Act as an e-commerce SEO and culinary expert. For a product named "${productName}", generate a set of comma-separated tags. 
    Include:
    1. The product name.
    2. Common dishes, snacks, or recipes where this product is a key ingredient (e.g., if the product is "Potato", include "Pakoda", "Samosa", "French Fries", "Aloo Paratha").
    3. Related search terms for quick commerce.
    4. Regional names if applicable.
    Return ONLY the comma-separated tags, no other text or explanation.`;
  return await generateWithFallback(prompt, 'tags');
};
