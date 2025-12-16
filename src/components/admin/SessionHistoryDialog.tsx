import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Badge } from "../../components/ui/badge";
import { Calendar, Users } from "lucide-react";

interface Session {
  id: string;
  started_at: string;
  stopped_at: string | null;
  status: string;
  qr_rotation_count: number;
}

interface Attendance {
  id: string;
  first_name: string;
  last_name: string;
  crn: string;
  submitted_at: string;
}

interface SessionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  subjectName: string;
}

export const SessionHistoryDialog = ({
  isOpen,
  onClose,
  subjectId,
  subjectName,
}: SessionHistoryDialogProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendanceBySession, setAttendanceBySession] = useState<Record<string, Attendance[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && subjectId) {
      loadSessions();
    }
  }, [isOpen, subjectId]);

  const loadSessions = async () => {
    setIsLoading(true);
    
    const { data: sessionsData, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .eq("subject_id", subjectId)
      .order("started_at", { ascending: false });

    if (sessionsError) {
      console.error("Error loading sessions:", sessionsError);
      setIsLoading(false);
      return;
    }

    setSessions(sessionsData || []);

    // Load attendance for all sessions
    if (sessionsData && sessionsData.length > 0) {
      const sessionIds = sessionsData.map((s) => s.id);
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .in("session_id", sessionIds)
        .order("submitted_at", { ascending: true });

      if (!attendanceError && attendanceData) {
        const grouped: Record<string, Attendance[]> = {};
        attendanceData.forEach((record) => {
          if (!grouped[record.session_id]) {
            grouped[record.session_id] = [];
          }
          grouped[record.session_id].push(record);
        });
        setAttendanceBySession(grouped);
      }
    }

    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Session History - {subjectName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sessions yet for this subject.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {sessions.map((session) => {
              const attendance = attendanceBySession[session.id] || [];
              return (
                <AccordionItem key={session.id} value={session.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div>
                        <p className="font-semibold">
                          {formatDate(session.started_at)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(session.started_at)}
                          {session.stopped_at && ` - ${formatTime(session.stopped_at)}`}
                        </p>
                      </div>
                      <Badge variant={session.status === "active" ? "default" : "secondary"}>
                        {session.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {attendance.length}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {attendance.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No attendance records for this session.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>First Name</TableHead>
                            <TableHead>Last Name</TableHead>
                            <TableHead>CRN</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendance.map((record, index) => (
                            <TableRow key={record.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{record.first_name}</TableCell>
                              <TableCell>{record.last_name}</TableCell>
                              <TableCell>{record.crn}</TableCell>
                              <TableCell>{formatTime(record.submitted_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </DialogContent>
    </Dialog>
  );
};
