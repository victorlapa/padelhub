import CourtUser from "./CourtUser";

interface Player {
  id: string;
  name: string;
  elo?: number;
  team: "A" | "B";
  position: "left" | "right";
}

interface CourtProps {
  players?: Player[];
  confirmedPlayers?: Set<string>;
}

const Court = ({ players = [], confirmedPlayers = new Set() }: CourtProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="relative aspect-[2/3] w-full max-w-md rounded-lg border-4 border-white bg-gradient-to-b from-emerald-600 to-emerald-700 shadow-2xl">
        {/* Court surface pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.1)_20px,rgba(255,255,255,0.1)_21px)]" />
        </div>

        {/* Center line (vertical) */}
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-white" />

        {/* Service lines (horizontal) */}
        <div className="absolute left-0 top-[20%] h-0.5 w-full bg-white" />
        <div className="absolute bottom-[20%] left-0 h-0.5 w-full bg-white" />

        {/* Net in the center */}
        <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 border-y-2 border-white bg-gray-800/50">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_4px,rgba(255,255,255,0.3)_4px,rgba(255,255,255,0.3)_5px)]" />
        </div>

        {/* Service boxes (left and right of center line) */}
        <div className="absolute left-0 top-[20%] h-[60%] w-1/2">
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/60" />
        </div>
        <div className="absolute right-0 top-[20%] h-[60%] w-1/2">
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/60" />
        </div>

        {/* Corner radius decorations */}
        <div className="absolute left-2 top-2 h-3 w-3 rounded-full border-2 border-white/40" />
        <div className="absolute right-2 top-2 h-3 w-3 rounded-full border-2 border-white/40" />
        <div className="absolute bottom-2 left-2 h-3 w-3 rounded-full border-2 border-white/40" />
        <div className="absolute bottom-2 right-2 h-3 w-3 rounded-full border-2 border-white/40" />

        {/* Players */}
        {players.map((player) => (
          <CourtUser
            key={player.id}
            name={player.name}
            elo={player.elo}
            team={player.team}
            position={player.position}
            isConfirmed={confirmedPlayers.has(player.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Court;
