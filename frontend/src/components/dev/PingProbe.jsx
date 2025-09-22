import { useEffect, useState } from "react";
import api from "../../services/api";

export default function PingProbe() {
  const [status, setStatus] = useState("…");

  useEffect(() => {
    let alive = true;
    api.get("/ping")
      .then(res => alive && setStatus(res.data?.status || JSON.stringify(res.data)))
      .catch(err => alive && setStatus("failed: " + (err.response?.status || err.message)));
    return () => { alive = false; };
  }, []);

  return <div style={{padding:8, fontFamily:"monospace"}}>API ping: {status}</div>;
}
