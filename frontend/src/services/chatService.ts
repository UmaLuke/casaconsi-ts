// src/services/chatService.ts
import * as signalR from '@microsoft/signalr';
import type { ConversationSummary, ChatMessage } from '../types/chat';
import { apiFetch } from './httpClient';
import { API_URL } from '../config';

export class ChatError extends Error {}

const authHeaders = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });

const handleChatResponse = async <T>(
  response: Response,
  fallbackMessage = 'No se pudo completar la operación. Probá de nuevo.',
): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? fallbackMessage;
    if (!body?.message) {
      console.error(`[chatService] ${response.status} ${response.url} sin mensaje de error legible.`, body);
    }
    throw new ChatError(message);
  }
  return response.json();
};

export const getConversations = (token: string): Promise<ConversationSummary[]> =>
  apiFetch(`/api/chat`, { headers: authHeaders(token) }).then((r) =>
    handleChatResponse<ConversationSummary[]>(r, 'No se pudieron cargar tus conversaciones.'),
  );

export const getMessages = (token: string, matchId: string): Promise<ChatMessage[]> =>
  apiFetch(`/api/chat/${matchId}/messages`, { headers: authHeaders(token) }).then((r) =>
    handleChatResponse<ChatMessage[]>(r, 'No se pudo cargar el historial de esta conversación.'),
  );

// Conexión SignalR centralizada — API_URL viene de config.ts (VITE_API_URL),
// nunca hardcodeada. El token va por accessTokenFactory porque el cliente
// WebSocket no manda headers custom; el backend lo lee de la query string
// (?access_token=...) solo para /hubs/chat — ver Program.cs, OnMessageReceived.
export const createChatConnection = (token: string): signalR.HubConnection =>
  new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/chat`, {
      accessTokenFactory: () => token, 
      withCredentials: false,
     })
    .withAutomaticReconnect()
    .build();