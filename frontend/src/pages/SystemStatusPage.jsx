import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { publicApi } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const STATUS_MAP = {
  healthy: {
    label: "Healthy",
    tone: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  operational: {
    label: "Operational",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: CheckCircle2,
  },
  degraded: {
    label: "Degraded",
    tone: "bg-amber-50 text-amber-700 border-amber-100",
    icon: AlertTriangle,
  },
  down: {
    label: "Down",
    tone: "bg-rose-50 text-rose-700 border-rose-100",
    icon: AlertTriangle,
  },
};

export function SystemStatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await publicApi.status();
      setStatus(data);
    } catch (err) {
      console.error("Failed to load system status", err);
      setError(
        err?.response?.data?.error || err?.message || "Unable to load system metrics right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const summary = useMemo(() => {
    if (!status) return null;
    const meta = STATUS_MAP[status.status] || STATUS_MAP.healthy;
    const Icon = meta.icon;
    return { ...meta, Icon };
  }, [status]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/60 via-white to-blue-50/30 pb-16 pt-24">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8">
        <header className="text-center">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            System status
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            Real-time health of MoringaDesk services
          </h1>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Track the availability of the API, database, and supporting services. If something
            looks off, we’ll update this page as we investigate.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
            <Button variant="outline" onClick={loadStatus} disabled={loading}>
              Refresh status
            </Button>
            {status?.timestamp && (
              <span>Last updated · {new Date(status.timestamp).toLocaleString()}</span>
            )}
          </div>
        </header>

        <section className="mt-10 space-y-6">
          {loading && (
            <Card className="border bg-white/90 text-slate-500">
              <CardContent className="flex items-center justify-center gap-3 py-16 text-sm">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                Checking services…
              </CardContent>
            </Card>
          )}

          {!loading && error && (
            <Card className="border-rose-200 bg-rose-50/70 text-rose-600">
              <CardContent className="py-10 text-center text-sm">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && status && summary && (
            <Card className="border bg-white shadow-sm">
              <CardHeader className="flex flex-col items-center gap-3 text-center">
                <summary.Icon className={`h-10 w-10 ${summary.tone.split(" ")[1]}`} />
                <CardTitle className="text-2xl font-semibold text-slate-900">
                  Platform is {summary.label.toLowerCase()}
                </CardTitle>
                <p className="text-sm text-slate-500">
                  All critical services are monitored continuously.
                </p>
              </CardHeader>
            </Card>
          )}

          {!loading && !error && Array.isArray(status?.checks) && (
            <div className="grid gap-4 md:grid-cols-2">
              {status.checks.map((check) => {
                const meta = STATUS_MAP[check.status] || STATUS_MAP.healthy;
                const Icon = meta.icon;
                return (
                  <Card key={check.id} className={`border ${meta.tone.split(" ")[2]} bg-white`}>
                    <CardHeader className="flex flex-row items-center gap-3">
                      <span
                        className={`inline-flex items-center justify-center rounded-full border ${meta.tone} p-2`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <CardTitle className="text-base text-slate-900">{check.name}</CardTitle>
                        <p className="text-sm text-slate-500">{meta.label}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-600">
                      {check.details && <p>{check.details}</p>}
                      {check.metrics && (
                        <ul className="text-xs text-slate-500">
                          {Object.entries(check.metrics).map(([key, value]) => (
                            <li key={key}>
                              <span className="font-medium capitalize">{key}</span>: {value}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <Card className="border bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Need help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                If you suspect an outage, reach out to facilitators via the community Slack or email
                support@moringadesk.com. Include any error messages you encounter.
              </p>
              <p>
                You can also follow our status updates on the #announcements channel for real-time
                notices.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default SystemStatusPage;
