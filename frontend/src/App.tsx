import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UppyDashboard from "./component/uppy/UppyDashboard";
import Layout4 from "./component/Layout";
import Register from "./component/auth/Register";
import Login from "./component/auth/Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout4 />,
    children: [
      { path: "", element: <Register /> },
      { path: "Login", element: <Login /> },      
      { path: "UppyDashboard", element: <UppyDashboard /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
