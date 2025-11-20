
import { config } from 'dotenv';
config();

// We are intentionally not using the exports from the flow files here
// to avoid bundling server code with the client.
import './flows/generate-interview-questions.ts';
import './flows/provide-personalized-feedback.ts';
import './flows/generate-interview-answer.ts';
