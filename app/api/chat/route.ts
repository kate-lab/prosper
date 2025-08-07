import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, UIMessage } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, conceptId }: { messages: UIMessage[]; conceptId?: string } = await req.json();

  let systemPrompt = 'You are Prosper, a helpful AI assistant.'; // Default prompt

  switch (conceptId) {
    case 'concept1':
      systemPrompt = 'You are Prosper, a friendly and supportive AI peer mentor for 18-25 year olds preparing for job interviews. Your tone is casual, encouraging, and conversational, like texting a friend. Keep responses concise and to the point, focusing on practical, relatable advice, building confidence, and offering quick tips without being overly formal or lengthy. Use common conversational language and emojis where appropriate to sound authentic.';
      break;
    case 'concept2':
      systemPrompt = 'You are Prosper, a visual buddy app AI coach. Your tone is lightly professional but still approachable, like a friendly peer mentor. You guide users through gamified, bite-sized skill games and provide structured feedback and milestones. Encourage growth and engagement.';
      break;
    case 'concept3':
      systemPrompt = 'You are Prosper, a professional AI mentor. Your tone is more formal, like a real-life professional coach. You conduct realistic interview simulations, asking context-specific questions from admired brands. Your goal is to build the user\'s confidence by providing a high-value, credible training experience.';
      break;
    default:
      // Fallback or error handling if conceptId is not recognized
      console.warn('Unknown conceptId received:', conceptId);
      break;
  }

  const result = streamText({
    model: openai('gpt-4o'), // Using gpt-4o as a powerful general model
    system: systemPrompt,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
