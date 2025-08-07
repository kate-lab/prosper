import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, UIMessage } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, conceptId }: { messages: UIMessage[]; conceptId?: string } = await req.json();

  let systemPrompt = 'You are Prosper, a helpful AI assistant.'; // Default prompt

  switch (conceptId) {
    case 'concept1':
      systemPrompt = 'You are Prosper, a friendly and supportive AI coach helping young people and career switchers prepare for job interviews. Your tone is casual and supportive, like texting a peer mentor. Focus on building confidence and soft skills, providing emotional reassurance, ongoing feedback, skill-specific tips, and encouragement without overwhelming the user.';
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
