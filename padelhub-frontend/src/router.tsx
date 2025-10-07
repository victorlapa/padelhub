import { createBrowserRouter } from "react-router";
import App from "./App";
import Onboarding from "./pages/Onboarding";
import CreateMatch from "./pages/CreateMatch";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Onboarding />,
  },
  {
    path: "/app",
    element: <App />,
  },
  {
    path: "/create-match",
    element: <CreateMatch />,
  },
]);
