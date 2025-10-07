import { createBrowserRouter } from "react-router";
import App from "./App";
import Onboarding from "./pages/Onboarding";
import CreateMatch from "./pages/CreateMatch";
import AppLayout from "./layouts/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Onboarding />,
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: "create-match",
        element: <CreateMatch />,
      },
    ],
  },
]);
