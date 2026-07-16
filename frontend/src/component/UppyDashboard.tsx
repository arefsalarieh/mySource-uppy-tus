import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import Dashboard from "@uppy/react/dashboard";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import { useState } from "react";

export default function UppyDashboard() {
  const [uppy] = useState(() =>
    new Uppy().use(Tus, {
      endpoint: "http://localhost:5000/files",
    }),
  );

  return (
    <>
      <h1>UppyDashboard</h1>
      <Dashboard uppy={uppy} />
    </>
  );
}
