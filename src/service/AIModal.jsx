import {
  GoogleGenerativeAI,
} from '@google/generative-ai';

// Access the API key from Vite environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Check if API key is undefined
console.log("Gemini API Key:", import.meta.env.VITE_GEMINI_API_KEY);
console.log("API Key length:", apiKey ? apiKey.length : 'undefined');

if (!apiKey) {
  console.error('Google Generative AI API key is missing. Please check your .env.local file.');
  throw new Error('Google Generative AI API key is missing. Please check your .env.local file.');
}

if (apiKey.length < 30) {
  console.error('Google Generative AI API key appears to be too short. Please check your .env.local file.');
  throw new Error('Google Generative AI API key appears to be invalid (too short). Please check your .env.local file.');
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export const chatSession = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [{ text: "Generate Travel Plan for Location : Las Vegas, for 3 Days for Couple with a Cheap budget ,Give me a Hotels options list with HotelName, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and  suggest itinerary with placeName, Place Details, Place Image Url, Geo Coordinates, ticket Pricing, rating, Time travel each of the location for 3 days with each day plan with best time to visit in JSON format." }],
    },
    {
      role: "model",
      parts: [{ text: "{\"hotels\":[{\"hotelName\":\"The D Las Vegas\",\"hotelAddress\":\"Fremont Street, Las Vegas, NV\",\"price\":\"$50 per night\",\"hotelImageUrl\":\"https://www.thed.com/images/hero/main-hero-02.jpg\",\"geoCoordinates\":{\"lat\":36.1699,\"lng\":-115.1438},\"rating\":4,\"description\":\"A budget-friendly hotel located in downtown Las Vegas with easy access to attractions.\"}]}" }],
    },
  ],
});

// Function to send a message and get a response
export async function sendMessage(userMessage) {
  try {
    console.log('Sending message to AI:', userMessage);
    console.log('Using chatSession:', chatSession);
    const result = await chatSession.sendMessage(userMessage);
    console.log('Raw AI result:', result);
    const response = await result.response;
    console.log('AI response:', response);
    const text = response.text();
    console.log('AI response text:', text);
    return text;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Error response details:', error.response);
    }
    
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    // Provide more specific error messages
    if (error.message && error.message.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Google Generative AI API key. Please check your API key configuration.');
    } else if (error.message && error.message.includes('400')) {
      throw new Error('Bad request to Google Generative AI API. Please check your request format.');
    } else if (error.message && error.message.includes('403')) {
      throw new Error('Access forbidden to Google Generative AI API. Please check your API key permissions.');
    } else if (error.message && error.message.includes('429')) {
      throw new Error('Rate limit exceeded for Google Generative AI API. Please try again later.');
    } else if (error.message && error.message.includes('500')) {
      throw new Error('Google Generative AI API server error. Please try again later.');
    }
    
    throw error;
  }
}

// Streaming function similar to the pattern you showed
export async function sendMessageStream(userMessage) {
  try {
    console.log('Sending message to AI (streaming):', userMessage);
    
    // Get the model directly for streaming
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });
    
    console.log('Model initialized for streaming');
    const result = await model.generateContentStream(userMessage);
    console.log('Stream result received:', result);
    
    // Process the stream
    let fullResponse = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      console.log('Stream chunk:', chunkText);
    }
    
    console.log('Full streamed response:', fullResponse);
    return fullResponse;
  } catch (error) {
    console.error("Error sending message to AI (streaming):", error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Error response details:', error.response);
    }
    
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    // Provide more specific error messages
    if (error.message && error.message.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Google Generative AI API key. Please check your API key configuration.');
    } else if (error.message && error.message.includes('400')) {
      throw new Error('Bad request to Google Generative AI API. Please check your request format.');
    } else if (error.message && error.message.includes('403')) {
      throw new Error('Access forbidden to Google Generative AI API. Please check your API key permissions.');
    } else if (error.message && error.message.includes('429')) {
      throw new Error('Rate limit exceeded for Google Generative AI API. Please try again later.');
    } else if (error.message && error.message.includes('500')) {
      throw new Error('Google Generative AI API server error. Please try again later.');
    }
    
    throw error;
  }
}

// Example usage function
async function main() {
  const userMessage = "INSERT_INPUT_HERE";
  try {
    const response = await sendMessage(userMessage);
    console.log(response);
  } catch (error) {
    console.error("Error in main:", error);
  }
}

// Uncomment the line below if you want to run the example when the module loads
// main();