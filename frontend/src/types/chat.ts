// src/types/chat.ts
// Espejo de ConversationSummaryDto en CasaConSi.Api/DTOs/Chat/ChatDtos.cs
export interface ConversationSummary {
  matchId: string;
  counterpartUserId: string;
  counterpartName: string;
  counterpartPhotoUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

// Espejo de MessageDto en CasaConSi.Api/DTOs/Chat/ChatDtos.cs
export interface ChatMessage {
  id: string;
  matchId: string;
  senderUserId: string;
  content: string;
  createdAt: string;
}