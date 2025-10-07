import { Outlet } from "react-router";
import BottomNav from "@/components/BottomNav";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col pb-16">
      <main className="flex-1">
        <Outlet />
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}