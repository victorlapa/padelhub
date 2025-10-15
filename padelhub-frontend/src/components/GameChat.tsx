import { Send, X, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMatchMessages,
  sendMatchMessage,
  type MatchMessage,
} from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { getProxiedImageUrl } from "@/utils/imageProxy";

interface GameChatProps {
  isChatOpen: boolean;
  setIsChatOpen: (bool: boolean) => void;
  matchId: string;
}

export default function GameChat({
  isChatOpen,
  setIsChatOpen,
  matchId,
}: GameChatProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Fetch messages with polling (only when chat is open)
  const {
    data: messages = [],
    isLoading,
  } = useQuery({
    queryKey: ["matchMessages", matchId],
    queryFn: () => getMatchMessages(matchId, 50),
    enabled: !!matchId && isChatOpen,
    refetchInterval: isChatOpen ? 3000 : false, // Poll every 3 seconds when chat is open
    refetchOnWindowFocus: true,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageText: string) =>
      sendMatchMessage(matchId, {
        userId: user!.id,
        message: messageText,
      }),
    onMutate: async (messageText) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["matchMessages", matchId] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<MatchMessage[]>([
        "matchMessages",
        matchId,
      ]);

      // Optimistically update to the new value
      const optimisticMessage: MatchMessage = {
        id: `temp-${Date.now()}`,
        matchId,
        userId: user!.id,
        message: messageText,
        createdAt: new Date().toISOString(),
        user: user!,
      };

      queryClient.setQueryData<MatchMessage[]>(
        ["matchMessages", matchId],
        (old = []) => [...old, optimisticMessage]
      );

      return { previousMessages };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["matchMessages", matchId],
          context.previousMessages
        );
      }
      alert(`Erro ao enviar mensagem: ${error.message}`);
    },
    onSuccess: () => {
      // Refetch to get the real message from server
      queryClient.invalidateQueries({ queryKey: ["matchMessages", matchId] });
      setMessage("");
    },
  });

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !user) return;

    sendMessageMutation.mutate(message.trim());
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // Detect if user scrolled up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setAutoScroll(isAtBottom);
  };

  // Format message timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 bg-white transition-transform duration-300 ease-in-out ${
        isChatOpen ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ height: "60vh" }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
          <h3 className="text-lg font-semibold">Chat do Jogo</h3>
          <button
            onClick={() => setIsChatOpen(false)}
            className="rounded-full p-1 transition-colors hover:bg-gray-200"
            aria-label="Fechar chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 space-y-3 overflow-y-auto p-4"
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              <p className="text-sm">
                Nenhuma mensagem ainda. Seja o primeiro a enviar!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.userId === user?.id;
              const proxiedAvatar = getProxiedImageUrl(
                msg.user.profilePictureUrl
              );

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {proxiedAvatar ? (
                      <img
                        src={proxiedAvatar}
                        alt={`${msg.user.firstName} ${msg.user.lastName}`}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-600">
                        {msg.user.firstName.charAt(0)}
                        {msg.user.lastName.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.message}</p>
                    <div
                      className={`mt-1 flex items-center gap-2 text-xs ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      <span className="font-medium">
                        {isOwnMessage
                          ? "Você"
                          : `${msg.user.firstName} ${msg.user.lastName}`}
                      </span>
                      <span>•</span>
                      <span>{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* New messages indicator */}
        {!autoScroll && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
            <button
              onClick={() => {
                setAutoScroll(true);
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-lg hover:bg-blue-600"
            >
              ↓ Novas mensagens
            </button>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={sendMessageMutation.isPending}
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Enviar mensagem"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
