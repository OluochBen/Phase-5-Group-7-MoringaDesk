import { useEffect, useState } from "react";
import { healthApi } from "../../services/api";

export default function PingProbe() {
  const [status, setStatus] = useState("…");

  useEffect(() => {
    let alive = true;

    healthApi
      .ping()
      .then((data) => {
        if (!alive) return;
        if (typeof data === "string" && /<!doctype html|<html/i.test(data)) {
          setStatus("not configured");
        } else if (data && typeof data === "object" && (data.status || data.ok)) {
          setStatus(String(data.status || data.ok));
        } else {
          setStatus("ok");
        }
      })
      .catch((err) => {
        if (!alive) return;
        setStatus("failed: " + (err.response?.status || err.message));
      });

    return () => {
      alive = false;
    };
  }, []);

  return <div className="p-2 font-mono">API ping: {status}</div>;
}
