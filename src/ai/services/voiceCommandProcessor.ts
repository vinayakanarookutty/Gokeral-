// src/ai/services/voiceCommandProcessor.ts
import ModelClient, { isUnexpected, ChatCompletionsOutput } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = import.meta.env.VITE_GITHUB_TOKEN as string;
const endpoint = import.meta.env.VITE_GITHUB_ENDPOINT as string;
const model = import.meta.env.VITE_GITHUB_MODEL as string;

if (!token || !endpoint || !model) {
  throw new Error("Missing GitHub Models environment variables");
}

const client = ModelClient(endpoint, new AzureKeyCredential(token));

// Command action types
export type CommandAction = 
  | "book_ride" 
  | "cancel_booking" 
  | "view_bookings" 
  | "vehicle_preference"
  | "fare_estimate"
  | "driver_contact"
  | "help"
  | "invalid_location"
  | "unknown";

export interface ProcessedCommand {
  action: CommandAction;
  userMessage: string;  // Response in user's language
  systemMessage: string; // Internal system message in English
  data?: {
    origin?: string;
    destination?: string;
    vehicleType?: string;
    bookingId?: string;
    dateTime?: string;
    numberOfPassengers?: number;
  };
  detectedLanguage?: string;
  confidence?: number;
}

// Official Kerala districts and major towns
const VALID_KERALA_PLACES = [
  // Districts (14)
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
  "Kozhikode", "Wayanad", "Kannur", "Kasaragod",
  
  // Major Cities/Towns
  "Kochi", "Trivandrum", "Calicut", "Thrissur City", "Kollam City",
  "Alappuzha Town", "Kottayam Town", "Palakkad Town", "Kannur Town",
  "Kozhikode City", "Thalassery", "Manjeri", "Tirur", "Ponnani",
  "Guruvayur", "Ottapalam", "Changanassery", "Muvattupuzha", "Kothamangalam",
  "Aluva", "Perumbavoor", "Angamaly", "Thrippunithura", "Kalamassery",
  "Munnar", "Thekkady", "Varkala", "Kovalam", "Bekal",
  "Payyanur", "Kanhangad", "Nileshwar", "Koyilandy", "Vadakara",
  "Kunnamkulam", "Chalakudy", "Kodungallur", "Irinjalakuda", "Cherthala",
  "Kayamkulam", "Haripad", "Mavelikkara", "Tiruvalla", "Adoor",
  "Pandalam", "Ranni", "Thodupuzha", "Kattappana", "Nedumkandam",
  "Pala", "Ettumanoor", "Vaikom", "Erattupetta", "Mundakayam",
  "Attingal", "Neyyattinkara", "Nedumangad", "Varkala", "Karunagappally",
  "Punalur", "Paravur", "Kottarakkara", "Anchal", "Kundara"
];

// Place name variations and mappings
const PLACE_VARIATIONS: Record<string, string> = {
  "trivandrum": "Thiruvananthapuram",
  "tvm": "Thiruvananthapuram",
  "cochin": "Kochi",
  "ernakulam": "Kochi",
  "calicut": "Kozhikode",
  "quilon": "Kollam",
  "alleppey": "Alappuzha",
  "alleppy": "Alappuzha",
  "palghat": "Palakkad",
  "cannanore": "Kannur",
  "trichur": "Thrissur",
};

const LANGUAGE_RESPONSES: Record<string, {
  bookingConfirm: (from: string, to: string, vehicle?: string) => string;
  invalidLocation: (place: string) => string;
  noLocationFound: () => string;
  viewBookings: () => string;
  cancelBooking: () => string;
  fareEstimate: (from: string, to: string) => string;
  vehiclePreference: (vehicle: string) => string;
  help: () => string;
  didNotUnderstand: () => string;
}> = {
  "ml-IN": {
    bookingConfirm: (from, to, vehicle) => 
      vehicle 
        ? `${from} ൽ നിന്ന് ${to} ലേക്ക് ${vehicle} ബുക്ക് ചെയ്യുന്നു`
        : `${from} ൽ നിന്ന് ${to} ലേക്ക് വാഹനം ബുക്ക് ചെയ്യുന്നു`,
    invalidLocation: (place) => `ക്ഷമിക്കണം, "${place}" കേരളത്തിൽ കണ്ടെത്താനായില്ല. ദയവായി ശരിയായ സ്ഥലം പറയൂ`,
    noLocationFound: () => "ദയവായി ആരംഭ സ്ഥലവും ലക്ഷ്യസ്ഥാനവും വ്യക്തമായി പറയൂ",
    viewBookings: () => "നിങ്ങളുടെ ബുക്കിംഗുകൾ കാണിക്കുന്നു",
    cancelBooking: () => "ബുക്കിംഗ് റദ്ദാക്കുന്നു",
    fareEstimate: (from, to) => `${from} ൽ നിന്ന് ${to} ലേക്കുള്ള നിരക്ക് കണക്കാക്കുന്നു`,
    vehiclePreference: (vehicle) => `${vehicle} തിരയുന്നു`,
    help: () => "ഞാൻ നിങ്ങളെ സഹായിക്കാം. റൈഡ് ബുക്ക് ചെയ്യാൻ സ്ഥലങ്ങൾ പറയൂ",
    didNotUnderstand: () => "ക്ഷമിക്കണം, മനസ്സിലായില്ല. വീണ്ടും പറയാമോ?"
  },
  "hi-IN": {
    bookingConfirm: (from, to, vehicle) => 
      vehicle
        ? `${from} से ${to} के लिए ${vehicle} बुक कर रहे हैं`
        : `${from} से ${to} के लिए गाड़ी बुक कर रहे हैं`,
    invalidLocation: (place) => `माफ़ करें, "${place}" केरल में नहीं मिला। कृपया सही जगह बताएं`,
    noLocationFound: () => "कृपया शुरुआती स्थान और गंतव्य स्पष्ट रूप से बताएं",
    viewBookings: () => "आपकी बुकिंग दिखा रहे हैं",
    cancelBooking: () => "बुकिंग रद्द कर रहे हैं",
    fareEstimate: (from, to) => `${from} से ${to} का किराया निकाल रहे हैं`,
    vehiclePreference: (vehicle) => `${vehicle} ढूंढ रहे हैं`,
    help: () => "मैं आपकी मदद कर सकता हूं। राइड बुक करने के लिए जगह बताएं",
    didNotUnderstand: () => "माफ़ करें, समझ नहीं आया। फिर से बताएं?"
  },
  "ta-IN": {
    bookingConfirm: (from, to, vehicle) => 
      vehicle
        ? `${from} இல் இருந்து ${to} க்கு ${vehicle} புக் செய்கிறோம்`
        : `${from} இல் இருந்து ${to} க்கு வாகனம் புக் செய்கிறோம்`,
    invalidLocation: (place) => `மன்னிக்கவும், "${place}" கேரளாவில் கிடைக்கவில்லை. சரியான இடத்தை சொல்லுங்கள்`,
    noLocationFound: () => "தயவுசெய்து தொடக்க இடம் மற்றும் சேருமிடத்தை தெளிவாக சொல்லுங்கள்",
    viewBookings: () => "உங்கள் புக்கிங்குகளை காட்டுகிறோம்",
    cancelBooking: () => "புக்கிங்கை ரத்து செய்கிறோம்",
    fareEstimate: (from, to) => `${from} இல் இருந்து ${to} க்கு கட்டணம் கணக்கிடுகிறோம்`,
    vehiclePreference: (vehicle) => `${vehicle} தேடுகிறோம்`,
    help: () => "நான் உங்களுக்கு உதவ முடியும். ரைடு புக் செய்ய இடங்களை சொல்லுங்கள்",
    didNotUnderstand: () => "மன்னிக்கவும், புரியவில்லை. மீண்டும் சொல்ல முடியுமா?"
  },
  "te-IN": {
    bookingConfirm: (from, to, vehicle) => 
      vehicle
        ? `${from} నుండి ${to} కు ${vehicle} బుక్ చేస్తున్నాము`
        : `${from} నుండి ${to} కు వాహనం బుక్ చేస్తున్నాము`,
    invalidLocation: (place) => `క్షమించండి, "${place}" కేరళలో కనిపించలేదు. దయచేసి సరైన ప్రదేశం చెప్పండి`,
    noLocationFound: () => "దయచేసి ప్రారంభ స్థలం మరియు గమ్యస్థానం స్పష్టంగా చెప్పండి",
    viewBookings: () => "మీ బుకింగ్‌లు చూపిస్తున్నాము",
    cancelBooking: () => "బుకింగ్ రద్దు చేస్తున్నాము",
    fareEstimate: (from, to) => `${from} నుండి ${to} కు ఛార్జీ లెక్కిస్తున్నాము`,
    vehiclePreference: (vehicle) => `${vehicle} వెతుకుతున్నాము`,
    help: () => "నేను మీకు సహాయం చేయగలను. రైడ్ బుక్ చేయడానికి స్థలాలు చెప్పండి",
    didNotUnderstand: () => "క్షమించండి, అర్థం కాలేదు. మళ్లీ చెప్పగలరా?"
  },
  "kn-IN": {
    bookingConfirm: (from, to, vehicle) => 
      vehicle
        ? `${from} ನಿಂದ ${to} ಗೆ ${vehicle} ಬುಕ್ ಮಾಡುತ್ತಿದ್ದೇವೆ`
        : `${from} ನಿಂದ ${to} ಗೆ ವಾಹನ ಬುಕ್ ಮಾಡುತ್ತಿದ್ದೇವೆ`,
    invalidLocation: (place) => `ಕ್ಷಮಿಸಿ, "${place}" ಕೇರಳದಲ್ಲಿ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸರಿಯಾದ ಸ್ಥಳ ಹೇಳಿ`,
    noLocationFound: () => "ದಯವಿಟ್ಟು ಪ್ರಾರಂಭ ಸ್ಥಳ ಮತ್ತು ಗಮ್ಯಸ್ಥಾನ ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ",
    viewBookings: () => "ನಿಮ್ಮ ಬುಕಿಂಗ್‌ಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇವೆ",
    cancelBooking: () => "ಬುಕಿಂಗ್ ರದ್ದುಗೊಳಿಸುತ್ತಿದ್ದೇವೆ",
    fareEstimate: (from, to) => `${from} ನಿಂದ ${to} ಗೆ ದರ ಲೆಕ್ಕ ಹಾಕುತ್ತಿದ್ದೇವೆ`,
    vehiclePreference: (vehicle) => `${vehicle} ಹುಡುಕುತ್ತಿದ್ದೇವೆ`,
    help: () => "ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ರೈಡ್ ಬುಕ್ ಮಾಡಲು ಸ್ಥಳಗಳನ್ನು ಹೇಳಿ",
    didNotUnderstand: () => "ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಹೇಳಬಹುದೇ?"
  },
  "en-IN": {
    bookingConfirm: (from, to, vehicle) => 
      vehicle
        ? `Booking ${vehicle} from ${from} to ${to}`
        : `Booking ride from ${from} to ${to}`,
    invalidLocation: (place) => `Sorry, "${place}" is not a valid location in Kerala. Please provide a correct place name`,
    noLocationFound: () => "Please clearly mention your pickup and drop location",
    viewBookings: () => "Showing your bookings",
    cancelBooking: () => "Cancelling your booking",
    fareEstimate: (from, to) => `Calculating fare from ${from} to ${to}`,
    vehiclePreference: (vehicle) => `Looking for ${vehicle}`,
    help: () => "I can help you book rides. Please tell me your locations",
    didNotUnderstand: () => "Sorry, I didn't understand that. Can you repeat?"
  }
};

const getSystemPrompt = (languageCode: string): string => {
  return `You are a voice assistant for Kerides, a Kerala vehicle booking app.

CRITICAL RULES:
1. ONLY accept locations from this EXACT list of Kerala places: ${VALID_KERALA_PLACES.join(", ")}
2. If user mentions ANY place NOT in this list, return action "invalid_location"
3. Extract origin and destination ONLY if both are valid Kerala locations
4. Convert place name variations (Trivandrum→Thiruvananthapuram, Cochin→Kochi, Calicut→Kozhikode)
5. User speaks in ${languageCode} - understand their intent

VEHICLE TYPES: Auto, Bike, Car, Sedan, SUV, Mini, Premium, Share

USER INTENTS:
- Book ride: User wants to go somewhere
- Cancel: User wants to cancel booking
- View bookings: User wants to see their bookings
- Fare estimate: User asks "how much" or "fare"
- Vehicle preference: User specifies vehicle type
- Help: User needs assistance

OUTPUT FORMAT (JSON only, no markdown):
{
  "action": "book_ride" | "cancel_booking" | "view_bookings" | "vehicle_preference" | "fare_estimate" | "help" | "invalid_location" | "unknown",
  "userMessage": "Response in user's language (${languageCode})",
  "systemMessage": "Internal message in English",
  "data": {
    "origin": "Valid Kerala place from list",
    "destination": "Valid Kerala place from list",
    "vehicleType": "if mentioned",
    "invalidPlace": "if location not in Kerala"
  },
  "confidence": 0.0-1.0
}

EXAMPLES:

Input: "കൊച്ചിയിൽ നിന്ന് തിരുവനന്തപുരത്തേക്ക് പോണം"
Output: {"action":"book_ride","userMessage":"കൊച്ചി ൽ നിന്ന് തിരുവനന്തപുരം ലേക്ക് വാഹനം ബുക്ക് ചെയ്യുന്നു","systemMessage":"Booking ride from Kochi to Thiruvananthapuram","data":{"origin":"Kochi","destination":"Thiruvananthapuram"},"confidence":0.95}

Input: "Bangalore to Kochi"
Output: {"action":"invalid_location","userMessage":"Sorry, Bangalore is not a valid location in Kerala. Please provide a Kerala location","systemMessage":"Invalid location: Bangalore","data":{"invalidPlace":"Bangalore"},"confidence":0.9}

Input: "Kozhikode to Mumbai car"
Output: {"action":"invalid_location","userMessage":"Sorry, Mumbai is not in Kerala. We only operate in Kerala","systemMessage":"Invalid location: Mumbai","data":{"invalidPlace":"Mumbai"},"confidence":0.9}

Input: "എന്റെ ബുക്കിംഗുകൾ കാണിക്കൂ"
Output: {"action":"view_bookings","userMessage":"നിങ്ങളുടെ ബുക്കിംഗുകൾ കാണിക്കുന്നു","systemMessage":"Showing bookings","confidence":0.9}

IMPORTANT: Return ONLY JSON. No explanations. Validate ALL locations against the Kerala places list.`;
};

function normalizePlace(place: string): string | null {
  const normalized = place.trim().toLowerCase();
  
  // Check variations first
  if (PLACE_VARIATIONS[normalized]) {
    return PLACE_VARIATIONS[normalized];
  }
  
  // Check if it's in valid places (case-insensitive)
  const validPlace = VALID_KERALA_PLACES.find(
    p => p.toLowerCase() === normalized
  );
  
  return validPlace || null;
}

function validateLocations(origin?: string, destination?: string): { 
  valid: boolean; 
  invalidPlace?: string;
  validOrigin?: string;
  validDestination?: string;
} {
  if (!origin || !destination) {
    return { valid: false };
  }

  const validOrigin = normalizePlace(origin);
  const validDestination = normalizePlace(destination);

  if (!validOrigin) {
    return { valid: false, invalidPlace: origin };
  }
  if (!validDestination) {
    return { valid: false, invalidPlace: destination };
  }

  return { valid: true, validOrigin, validDestination };
}

export async function processVoiceCommand(
  transcript: string,
  languageCode: string = "ml-IN"
): Promise<ProcessedCommand> {
  console.log(`[Voice Processor] Input: "${transcript}" | Language: ${languageCode}`);

  const responses = LANGUAGE_RESPONSES[languageCode] || LANGUAGE_RESPONSES["en-IN"];

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`[Voice Processor] Attempt ${attempt + 1}/3`);

      const response = await client.path("/chat/completions").post({
        body: {
          messages: [
            { role: "system", content: getSystemPrompt(languageCode) },
            { 
              role: "user", 
              content: `User said: "${transcript}"\n\nAnalyze and respond with JSON only.`
            },
          ],
          temperature: 0.2,
          max_tokens: 300,
          model,
        },
      });

      if (!isUnexpected(response)) {
        const body = response.body as ChatCompletionsOutput;
        const rawContent = body.choices?.[0]?.message?.content ?? "";
        
        console.log(`[Voice Processor] Raw AI Response:`, rawContent);

        if (!rawContent) {
          console.error("[Voice Processor] Empty response from AI");
          continue;
        }

        const cleaned = rawContent
          .trim()
          .replace(/^```json\s*/gi, "")
          .replace(/^```\s*/gi, "")
          .replace(/\s*```$/g, "")
          .trim();

        console.log(`[Voice Processor] Cleaned JSON:`, cleaned);

        try {
          const parsed = JSON.parse(cleaned) as ProcessedCommand;
          
          if (!parsed.action) {
            console.error("[Voice Processor] Missing action field");
            continue;
          }

          // Validate locations for booking actions
          if (parsed.action === "book_ride" || parsed.action === "fare_estimate") {
            const validation = validateLocations(
              parsed.data?.origin,
              parsed.data?.destination
            );

            if (!validation.valid) {
              return {
                action: "invalid_location",
                userMessage: validation.invalidPlace 
                  ? responses.invalidLocation(validation.invalidPlace)
                  : responses.noLocationFound(),
                systemMessage: validation.invalidPlace
                  ? `Invalid location: ${validation.invalidPlace}`
                  : "No valid locations provided",
                data: { invalidPlace: validation.invalidPlace },
                confidence: 0.9,
                detectedLanguage: languageCode
              };
            }

            // Update with normalized place names
            if (parsed.data) {
              parsed.data.origin = validation.validOrigin;
              parsed.data.destination = validation.validDestination;
            }

            // Generate appropriate user message
            parsed.userMessage = parsed.action === "book_ride"
              ? responses.bookingConfirm(
                  validation.validOrigin!, 
                  validation.validDestination!,
                  parsed.data?.vehicleType
                )
              : responses.fareEstimate(validation.validOrigin!, validation.validDestination!);
          }

          parsed.detectedLanguage = languageCode;
          console.log(`[Voice Processor] Success!`, parsed);
          return parsed;

        } catch (parseError) {
          console.error("[Voice Processor] JSON Parse Error:", parseError);
          continue;
        }

      } else {
        console.error("[Voice Processor] API Error:", response.status, response.body);
        
        if (response.status === 429 && attempt < 2) {
          console.log("[Voice Processor] Rate limited, waiting 2s...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }

    } catch (error) {
      console.error(`[Voice Processor] Attempt ${attempt + 1} failed:`, error);
      
      if (attempt === 2) {
        return {
          action: "unknown",
          userMessage: responses.didNotUnderstand(),
          systemMessage: "Processing failed after retries",
          confidence: 0,
          detectedLanguage: languageCode,
        };
      }
    }
  }

  return {
    action: "unknown",
    userMessage: responses.didNotUnderstand(),
    systemMessage: "Failed to process command",
    confidence: 0,
    detectedLanguage: languageCode,
  };
}