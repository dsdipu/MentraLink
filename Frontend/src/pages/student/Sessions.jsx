import { useEffect, useState } from "react";
import { getMySessions } from "../../services/sessionService";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { CalendarClock, MapPin, Video } from "lucide-react";

const STATUS_TONE = {
  UPCOMING: "info",
  ONGOING: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading sessions...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Sessions</h1>

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No sessions yet"
          description="Once your mentor schedules a session, it'll show up here."
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-medium text-brand-navy">#{s.sessionNumber} — {s.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {new Date(s.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  {s.time && ` · ${s.time}`}
                  {s.mentor?.user?.name && ` · with ${s.mentor.user.name}`}
                </p>
                {(s.location || s.meetingLink) && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    {s.meetingLink ? <Video size={12} /> : <MapPin size={12} />}
                    {s.meetingLink ? (
                      <a href={s.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        Join meeting
                      </a>
                    ) : (
                      s.location
                    )}
                  </p>
                )}
              </div>
              <Badge tone={STATUS_TONE[s.status] || "neutral"}>{s.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;