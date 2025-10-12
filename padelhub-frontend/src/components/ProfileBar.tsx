import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileBarProps {
  userName: string;
  elo: number;
  maxElo?: number;
  className?: string;
}

export default function ProfileBar({
  userName,
  elo,
  maxElo = 2000,
  className,
}: ProfileBarProps) {
  const progressPercentage = Math.min((elo / maxElo) * 100, 100);

  return (
    <div
      className={cn(
        "flex w-full items-center gap-4 rounded-lg border bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
        <User className="h-6 w-6 text-white" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="truncate text-lg font-semibold text-gray-900">
            {userName}
          </h3>
          <span className="text-sm font-medium text-gray-600">ELO: {elo}</span>
        </div>

        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>Iniciante</span>
          <span>Profissional</span>
        </div>
      </div>
    </div>
  );
}
