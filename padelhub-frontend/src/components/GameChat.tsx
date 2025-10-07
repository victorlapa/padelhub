import { Send, X } from "lucide-react";

interface GameChatProps {
  isChatOpen: boolean;
  setIsChatOpen: (bool: boolean) => void;
}

export default function GameChat({ isChatOpen, setIsChatOpen }: GameChatProps) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 bg-white transition-transform duration-300 ease-in-out ${
        isChatOpen ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ height: "60vh" }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
          <h3 className="text-lg font-semibold">Chat do Jogo</h3>
          <button
            onClick={() => setIsChatOpen(false)}
            className="rounded-full p-1 transition-colors hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="max-w-xs rounded-lg bg-gray-100 p-3">
            <p className="text-sm">Olá pessoal! Prontos para o jogo?</p>
            <span className="text-xs text-gray-500">João</span>
          </div>
          <div className="ml-auto max-w-xs rounded-lg bg-blue-100 p-3">
            <p className="text-sm">Sim! Vamos começar</p>
            <span className="text-xs text-gray-500">Você</span>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
