import { MessageCircle } from "lucide-react";

const ChatButton = ({ setIsChatOpen }: { setIsChatOpen: (a: any) => void }) => {
  return (
    <button
      onClick={() => setIsChatOpen(true)}
      className="fixed bottom-20 right-4 z-50 rounded-full bg-blue-600 p-4 text-white shadow-2xl transition-all hover:scale-110 hover:bg-blue-700"
    >
      <MessageCircle size={28} />
    </button>
  );
};

export default ChatButton;
