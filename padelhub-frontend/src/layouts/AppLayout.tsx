import { Outlet } from "react-router";
import BottomNav from "@/components/BottomNav";

export default function AppLayout() {
  return (
    <div className="flex h-screen flex-col">
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <div className="shrink-0">
        <BottomNav />
      </div>
    </div>
  );
}
