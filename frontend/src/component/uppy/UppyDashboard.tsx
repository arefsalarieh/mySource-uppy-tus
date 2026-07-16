import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import Dashboard from "@uppy/react/dashboard";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import { useEffect, useState } from "react";

interface UppyDashboardProps {
  courseId: string;
  sessionNumber: number;
}

export default function UppyDashboard() {
  const [courseId, setcourseId] = useState(
    "0e4f6246-68ba-4f54-bf74-12ee37279a9d",
  );
  const [sessionNumber, setsessionNumber] = useState("1");

  const token = localStorage.getItem("token") || "";

  const [uppy] = useState(() =>
    new Uppy({
      meta: {
        courseId,
        sessionNumber: String(sessionNumber),
      },
    }).use(Tus, {
      endpoint: "http://localhost:5000/api/file/upload",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );

  useEffect(() => {
    uppy.setMeta({
      courseId,
      sessionNumber: String(sessionNumber),
    });
  }, [courseId, sessionNumber, uppy]);

  return (
    <>
      <h1>UppyDashboard</h1>
      <Dashboard uppy={uppy} />

      <input
        type="text"
        placeholder="courseId"
        defaultValue={courseId}
        onChange={(e) => setcourseId(e.target.value)}
      />
      <input
        type="text"
        placeholder="sessionNumber"
        defaultValue={sessionNumber}
        onChange={(e) => setsessionNumber(e.target.value)}
      />
    </>
  );
}
