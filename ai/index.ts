import { wrapLanguageModel } from "ai";
import {  Middleware } from "./rag-middleware";
import { groq } from '@ai-sdk/groq';

export const wrappedLanguageModel = wrapLanguageModel({
  model: groq('llama-3.3-70b-versatile'),
  middleware: Middleware
})