import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UppyDashboard from "./component/uppy/UppyDashboard";
import Layout4 from "./component/Layout";
import Register from "./component/auth/Register";
import Login from "./component/auth/Login";
import AddCourse from "./component/course/AddCourse";
import GetAllCourses from "./component/course/GetAllCourses";
import VideoPlayer from "./component/course/VideoPlayer";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout4 />,
    children: [
      { path: "", element: <Register /> },
      { path: "Login", element: <Login /> },      
      { path: "UppyDashboard", element: <UppyDashboard /> },
      { path: "AddCourse", element: <AddCourse /> },
       { path: "GetAllCourses", element: <GetAllCourses /> },   
       
       { path: "VideoPlayer/:fileId", element: <VideoPlayer /> },          
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
