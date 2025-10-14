import { UserCircle2, CheckCircle2 } from "lucide-react";

interface CourtUserProps {
  icon?: string;
  name?: string;
  elo?: number;
  isConfirmed?: boolean;
}

export default function CourtUser({
  elo,
  icon,
  name,
  isConfirmed = false,
}: CourtUserProps) {
  return (
    <div>
      <div className="flex flex-col items-center gap-1">
        {/* Player avatar with team color */}
        <div className="relative">
          <div className={`rounded-full p-1 shadow-lg`}>
            {icon ? (
              <img
                width={32}
                height={32}
                src={icon}
                alt={name ?? "Player"}
                className="rounded-full"
              />
            ) : (
              <UserCircle2 width={32} height={32} className="text-white" />
            )}
          </div>
          {/* Confirmation badge */}
          {isConfirmed && (
            <div className="absolute -right-1 -top-1 rounded-full bg-green-500 p-0.5 shadow-md ring-2 ring-white">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>
        {/* Player info */}
        <div className="rounded-full bg-black/60 px-2 py-0.5 backdrop-blur-sm">
          <p className="flex items-center gap-1 text-xs font-medium text-white">
            <span>{name ?? "Usuário"}</span>
            <span className="text-yellow-400">[{elo ?? 0}]</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const getEloColor = (elo: number) => {
  if (elo) return "text-white";
};
