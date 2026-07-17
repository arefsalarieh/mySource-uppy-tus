import ReactPlayer from "react-player";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const VideoPlayer = () => {
  const { fileId } = useParams();
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    if (!token) {
      setError("You must be logged in to watch this video.");
      return;
    }

    const streamUrl = `http://localhost:5000/api/file/stream/${fileId}?token=${encodeURIComponent(token)}`;
    setUrl(streamUrl);
  }, [fileId]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!url) return <p>Loading video...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h3>Video Player</h3>
      <ReactPlayer controls width="100%" height="auto" onError={(e) => console.error("Playback error:", e)}>
        <source src={url} type="video/mp4" />
      </ReactPlayer>
    </div>
  );
};

export default VideoPlayer;