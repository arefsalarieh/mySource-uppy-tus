import axios from "axios";
import { useEffect, useState } from "react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
  files: unknown[];
}

const GetAllCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get("http://localhost:5000/api/course");

        setCourses(response.data.courses);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Failed to load courses.");
        }
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
              {course.description && <p>{course.description}</p>}
              <p>Course ID: {course.id}</p>
              <p>Owner: {course.user.email}</p>
              <p>Videos uploaded: {course.files.length}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GetAllCourses;