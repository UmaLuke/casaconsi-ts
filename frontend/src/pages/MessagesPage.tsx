// src/pages/MessagesPage.tsx
import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { Heart, MessageSquare, Send, User as UserIcon } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { getMatches, MatchError } from '../services/matchService';
import { getConversations, getMessages, createChatConnection, ChatError } from '../services/chatService';
import type { MatchSummary } from '../types/match';
import type { ConversationSummary, ChatMessage } from '../types/chat';
import { API_URL } from '../config';

export const MessagesPage = () => {
  const { token, user } = useAuth();

  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const selectedMatchIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    selectedMatchIdRef.current = selectedMatchId;
  }, [selectedMatchId]);

  // Match's confirmados (igual que antes)
  useEffect(() => {
    if (!token) {
      setIsLoadingMatches(false);
      return;
    }
    let cancelled = false;
    getMatches(token)
      .then((result) => { if (!cancelled) setMatches(result); })
      .catch((err) => {
        if (cancelled) return;
        setMatchesError(err instanceof MatchError ? err.message : 'No se pudieron cargar tus matches.');
      })
      .finally(() => { if (!cancelled) setIsLoadingMatches(false); });
    return () => { cancelled = true; };
  }, [token]);

  // Lista de conversaciones
  useEffect(() => {
    if (!token) {
      setIsLoadingConversations(false);
      return;
    }
    let cancelled = false;
    getConversations(token)
      .then((result) => {
        if (cancelled) return;
        setConversations(result);
        if (result.length > 0) {
          setSelectedMatchId((current) => current ?? result[0].matchId);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setConversationsError(err instanceof ChatError ? err.message : 'No se pudieron cargar tus conversaciones.');
      })
      .finally(() => { if (!cancelled) setIsLoadingConversations(false); });
    return () => { cancelled = true; };
  }, [token]);

  // Conexión SignalR — una por sesión, no por conversación
  useEffect(() => {
    if (!token) return;

    const connection = createChatConnection(token);
    connectionRef.current = connection;

    connection.on('ReceiveMessage', (message: ChatMessage) => {
      if (message.matchId === selectedMatchIdRef.current) {
        setMessages((current) => [...current, message]);
      }
      setConversations((current) =>
        current.map((c) =>
          c.matchId === message.matchId
            ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
            : c,
        ),
      );
    });

    connection.onreconnected(() => setIsConnected(true));
    connection.onreconnecting(() => setIsConnected(false));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => console.error('[MessagesPage] No se pudo conectar al chat en tiempo real.', err));

    return () => {
      connection.stop();
      connectionRef.current = null;
      setIsConnected(false);
    };
  }, [token]);

  // Historial + join/leave del grupo al cambiar de conversación
  useEffect(() => {
    if (!token || !selectedMatchId) return;

    let cancelled = false;
    setIsLoadingMessages(true);

    getMessages(token, selectedMatchId)
      .then((result) => { if (!cancelled) setMessages(result); })
      .catch((err) => console.error('[MessagesPage] No se pudo cargar el historial.', err))
      .finally(() => { if (!cancelled) setIsLoadingMessages(false); });

    return () => { cancelled = true; };
  }, [token, selectedMatchId]);

  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection || !isConnected || !selectedMatchId) return;

    connection.invoke('JoinConversation', selectedMatchId).catch((err) =>
      console.error('[MessagesPage] No se pudo unir a la conversación.', err),
    );

    return () => {
      connection.invoke('LeaveConversation', selectedMatchId).catch(() => {});
    };
  }, [selectedMatchId, isConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = draft.trim();
    const connection = connectionRef.current;
    if (!content || !selectedMatchId || !connection || !isConnected) return;

    setDraft('');
    try {
      await connection.invoke('SendMessage', selectedMatchId, content);
    } catch (err) {
      console.error('[MessagesPage] No se pudo enviar el mensaje.', err);
    }
  };

  const selectedConversation = conversations.find((c) => c.matchId === selectedMatchId) ?? null;

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20 md:pl-24">
        <div className="container mx-auto px-4 md:px-6 space-y-14">
          {/* Sección Match's (sin cambios) */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
              <div className="space-y-2 md:shrink-0">
                <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">Match&apos;s</h1>
                <p className="text-base-content/70 text-lg max-w-2xl font-medium">Aquí podrás ver tus conexiones.</p>
              </div>

              {isLoadingMatches ? (
                <div className="flex justify-center items-center py-16 rounded-2xl border border-base-200 md:flex-1">
                  <span className="loading loading-spinner loading-lg text-brand-teal" />
                </div>
              ) : matchesError ? (
                <div className="text-center py-16 px-4 border-2 border-dashed border-error/40 rounded-2xl md:flex-1">
                  <p className="text-lg font-medium text-error">{matchesError}</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl md:flex-1">
                  <Heart className="size-10 mx-auto text-base-content/30 mb-4" />
                  <p className="text-lg font-medium text-base-content/60">Todavía no tenés matches confirmados.</p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto p-4 rounded-2xl border border-base-200 snap-x snap-mandatory md:flex-1">
                  {matches.map((match) => (
                    <div key={match.id} className="snap-start shrink-0 w-36 flex flex-col items-center gap-2 p-4 rounded-2xl border border-base-200 bg-base-100 shadow-sm">
                      <div className="avatar">
                        <div className="w-20 rounded-full ring ring-brand-teal/30 ring-offset-2 ring-offset-base-100 bg-base-200">
                          {match.counterpartPhotoUrl ? (
                            <img src={`${API_URL}${match.counterpartPhotoUrl}`} alt={match.counterpartName} className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <UserIcon className="size-8 text-base-content/40" />
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-center truncate w-full">{match.counterpartName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Sección Mensajes */}
          <section>
            <div className="mb-6 space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">Mensajes</h1>
              <p className="text-base-content/70 text-lg max-w-2xl font-medium">Acá vas a poder chatear con tus matches.</p>
            </div>

            {isLoadingConversations ? (
              <div className="flex justify-center items-center py-16 rounded-2xl border border-base-200">
                <span className="loading loading-spinner loading-lg text-brand-teal" />
              </div>
            ) : conversationsError ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-error/40 rounded-2xl">
                <p className="text-lg font-medium text-error">{conversationsError}</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl">
                <MessageSquare className="size-10 mx-auto text-base-content/30 mb-4" />
                <p className="text-lg font-medium text-base-content/60">Todavía no tenés conversaciones activas.</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row border border-base-200 rounded-2xl overflow-hidden h-[32rem]">
                <div className="md:w-72 border-b md:border-b-0 md:border-r border-base-200 overflow-y-auto shrink-0">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.matchId}
                      onClick={() => setSelectedMatchId(conversation.matchId)}
                      className={`w-full flex items-center gap-3 p-4 text-left hover:bg-base-100 transition-colors ${conversation.matchId === selectedMatchId ? 'bg-base-100' : ''}`}
                    >
                      <div className="avatar shrink-0">
                        <div className="w-12 rounded-full bg-base-200">
                          {conversation.counterpartPhotoUrl ? (
                            <img src={`${API_URL}${conversation.counterpartPhotoUrl}`} alt={conversation.counterpartName} className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <UserIcon className="size-6 text-base-content/40" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{conversation.counterpartName}</p>
                        <p className="text-sm text-base-content/60 truncate">{conversation.lastMessage ?? 'Todavía no hay mensajes'}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                  {!selectedConversation ? (
                    <div className="flex-1 flex items-center justify-center text-base-content/50">Elegí una conversación</div>
                  ) : (
                    <>
                      <div className="p-4 border-b border-base-200 font-semibold">{selectedConversation.counterpartName}</div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {isLoadingMessages ? (
                          <div className="flex justify-center py-8">
                            <span className="loading loading-spinner text-brand-teal" />
                          </div>
                        ) : (
                          messages.map((message) => (
                            <div key={message.id} className={`flex ${message.senderUserId === user?.id ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${message.senderUserId === user?.id ? 'bg-brand-teal text-white' : 'bg-base-200 text-base-content'}`}>
                                {message.content}
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                      <form
                        onSubmit={(e) => { e.preventDefault(); void handleSend(); }}
                        className="p-4 border-t border-base-200 flex gap-2"
                      >
                        <input
                          type="text"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="Escribí un mensaje..."
                          className="input input-bordered flex-1 text-base-content"
                        />
                        <button type="submit" className="btn btn-square bg-brand-teal text-white border-none">
                          <Send className="size-5" />
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};