// Quick test script for Gemini API
const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Available Gemini models (as of November 2024)
const AVAILABLE_MODELS = [
  'gemini-1.5-flash',      // ✅ Recommended: Fast, efficient, good for most tasks
  'gemini-1.5-pro',        // ✅ More powerful but slower
  'gemini-pro',            // ✅ Original stable model
  'gemini-1.0-pro',        // Older version
];

async function testGeminiModel(modelName) {
  console.log(`\n🧪 Testing model: ${modelName}`);
  console.log('─'.repeat(50));

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: "Say 'Hello, I am working!' if you can read this."
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data.candidates && response.data.candidates.length > 0) {
      const text = response.data.candidates[0].content.parts[0].text;
      console.log(`✅ SUCCESS! Response: ${text}`);
      return true;
    } else {
      console.log('❌ No response from model');
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.log(`❌ ERROR: ${error.response.status} - ${error.response.data.error.message}`);
    } else {
      console.log(`❌ ERROR: ${error.message}`);
    }
    return false;
  }
}

async function listAvailableModels() {
  console.log('\n📋 Listing available Gemini models...');
  console.log('═'.repeat(50));

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const response = await axios.get(url);

    if (response.data.models) {
      console.log('\n✅ Available models:');
      response.data.models.forEach(model => {
        if (model.name.includes('gemini')) {
          const modelName = model.name.replace('models/', '');
          const supportsMethods = model.supportedGenerationMethods || [];
          const supportsChat = supportsMethods.includes('generateContent');
          console.log(`  ${supportsChat ? '✅' : '⚠️ '}  ${modelName}`);
        }
      });
    }
  } catch (error) {
    console.log('❌ Could not list models:', error.message);
  }
}

async function testFinancialAnalysis() {
  console.log('\n💰 Testing Financial Analysis...');
  console.log('═'.repeat(50));

  const model = 'gemini-1.5-flash';
  const testMetrics = {
    symbol: 'TEST',
    name: 'Test Company',
    peRatio: 25.5,
    roe: 15.2,
    profitMargin: 0.23,
    debtEquity: 1.5
  };

  const prompt = `
You are a financial analyst. Analyze these metrics and respond in JSON:
${JSON.stringify(testMetrics, null, 2)}

Provide:
{
  "summary": "Brief summary",
  "risk": "Low/Medium/High",
  "suggestion": "Investment suggestion"
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    if (response.data.candidates && response.data.candidates.length > 0) {
      const text = response.data.candidates[0].content.parts[0].text;
      console.log('\n✅ Analysis Response:');
      console.log(text);
      
      // Try to parse JSON
      try {
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const json = JSON.parse(cleanText);
        console.log('\n✅ Successfully parsed JSON!');
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('\n⚠️  Response is not valid JSON, but text response works');
      }
      
      return true;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     🧪 GEMINI API TESTING SUITE                  ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  if (!GEMINI_API_KEY) {
    console.log('\n❌ ERROR: GEMINI_API_KEY not found in .env file');
    console.log('Please add: GEMINI_API_KEY=your_key_here');
    return;
  }

  console.log(`\n🔑 API Key found: ${GEMINI_API_KEY.substring(0, 10)}...`);

  // List available models
  await listAvailableModels();

  // Test each model
  console.log('\n\n🧪 Testing Models...');
  console.log('═'.repeat(50));

  const results = {};
  for (const model of AVAILABLE_MODELS) {
    results[model] = await testGeminiModel(model);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }

  // Test financial analysis
  await testFinancialAnalysis();

  // Summary
  console.log('\n\n📊 SUMMARY');
  console.log('═'.repeat(50));
  const working = Object.entries(results).filter(([k, v]) => v);
  const notWorking = Object.entries(results).filter(([k, v]) => !v);

  console.log(`\n✅ Working models (${working.length}):`);
  working.forEach(([model]) => console.log(`   • ${model}`));

  if (notWorking.length > 0) {
    console.log(`\n❌ Not working models (${notWorking.length}):`);
    notWorking.forEach(([model]) => console.log(`   • ${model}`));
  }

  console.log('\n💡 RECOMMENDATION:');
  if (working.length > 0) {
    console.log(`   Use: ${working[0][0]}`);
    console.log(`\n   Update backend/config/constants.js:`);
    console.log(`   MODEL: '${working[0][0]}'`);
  } else {
    console.log('   ⚠️  No models working. Check your API key.');
  }

  console.log('\n✅ Test complete!');
}

// Run tests
main().catch(console.error);
