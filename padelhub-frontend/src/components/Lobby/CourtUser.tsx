import { TPosition } from "@/types/Player";
import { UserCircle2 } from "lucide-react";

interface CourtUserProps {
  icon?: string;
  name?: string;
  elo?: number;
  position?: "left" | "right";
  team?: "A" | "B";
}

export default function CourtUser({
  elo,
  icon,
  team,
  name,
  position,
}: CourtUserProps) {
  const teamColor = team === "A" ? "bg-blue-500" : "bg-red-500";

  return (
    <div
      className={`absolute ${getPlayerSide(position ?? "left")} ${getPlayerPosition(team ?? "A")} -translate-x-1/2 -translate-y-1/2`}
    >
      <div className="flex flex-col items-center gap-1">
        {/* Player avatar with team color */}
        <div className={`rounded-full ${teamColor} p-1 shadow-lg ring-2 ring-white`}>
          {icon ? (
            <img width={32} height={32} src={icon} alt={name ?? "Player"} className="rounded-full" />
          ) : (
            <UserCircle2 width={32} height={32} className="text-white" />
          )}
        </div>
        {/* Player info */}
        <div className="rounded-full bg-black/60 px-2 py-0.5 backdrop-blur-sm">
          <p className="flex items-center gap-1 text-xs font-medium text-white">
            <span>{name ?? "Usuário"}</span>
            <span className="text-yellow-400">
              [{elo ?? 0}]
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const getEloColor = (elo: number) => {
  if (elo) return "text-white";
};

const getPlayerSide = (side: TPosition) => {
  return side === "left" ? "left-[25%]" : "right-[25%]";
};

const getPlayerPosition = (pos: "A" | "B") => {
  return pos === "A" ? "top-[25%]" : "bottom-[25%]";
};
