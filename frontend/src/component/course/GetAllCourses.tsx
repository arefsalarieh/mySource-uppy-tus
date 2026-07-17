// frontend/src/components/GetAllCourses.tsx (بسط داده شده)
import axios from "axios";
import { useEffect, useState } from "react";
import VideoPlayer from "./VideoPlayer";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  user: { id: string; email: string };
  files: Array<{
    id: string;
    originalName: string;
    url: string;
    mimeType: string;
  }>;
}

const GetAllCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/course");
        console.log(response.data.courses)
        setCourses(response.data.courses);
      } catch (err) {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>All Courses</h1>
      {courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <ul>
          {courses.map((course) => (
            <li key={course.id}>
              <strong>{course.title}</strong>
              <p>Course ID: {course.id}</p>
              {course.description && <p>{course.description}</p>}
              <p>Owner: {course.user.email}</p>
              <p>Videos uploaded: {course.files.length}</p>

              {course.files.length > 0 && (
                <div>
                  <h4>Files:</h4>
                  <ul>
                    {course.files.map((file) => (
                      <li key={file.id}>
                        {file.originalName}{" "}                  
                        <Link to={`/VideoPlayer/${file.id}`}>detail</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* نمایش پلیر وقتی فایلی انتخاب شد */}
      {selectedFileId && (
        <div style={{ marginTop: "2rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
          <VideoPlayer fileId={selectedFileId} />
          <button onClick={() => setSelectedFileId(null)}>Close Player</button>
        </div>
      )}
    </div>
  );
};

export default GetAllCourses;