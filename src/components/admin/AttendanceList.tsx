import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { Card } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface Attendance {
  id: string;
  first_name: string;
  last_name: string;
  crn: string;
  submitted_at: string;
}

interface AttendanceListProps {
  sessionId: string;
}

export const AttendanceList = ({ sessionId }: AttendanceListProps) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    loadAttendance();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("attendance-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setAttendance((prev) => [...prev, payload.new as Attendance]);
          toast.success("New attendance submitted!", {
            icon: <CheckCircle2 className="h-4 w-4" />,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const loadAttendance = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("session_id", sessionId)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error loading attendance:", error);
      return;
    }
    setAttendance(data || []);
  };

  return (
    <Card className="p-6 shadow-glow">
      <h2 className="text-2xl font-bold mb-4">
        Attendance ({attendance.length})
      </h2>
      {attendance.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No attendance yet. Students will appear here when they submit.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>CRN</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.first_name}</TableCell>
                <TableCell>{record.last_name}</TableCell>
                <TableCell>{record.crn}</TableCell>
                <TableCell>
                  {new Date(record.submitted_at).toLocaleTimeString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};
