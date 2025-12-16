import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../integrations/supabase/client";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Play, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import { SessionHistoryDialog } from "./SessionHistoryDialog";

interface Subject {
  id: string;
  name: string;
  crn_number: string;
  day_time: string;
  created_at: string;
}

interface SubjectListProps {
  userId: string;
}

export const SubjectList = ({ userId }: SubjectListProps) => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [historySubject, setHistorySubject] = useState<Subject | null>(null);

  useEffect(() => {
    loadSubjects();
  }, [userId]);

  const loadSubjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("teacher_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading subjects:", error);
      toast.error("Failed to load subjects");
    } else {
      setSubjects(data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async (subjectId: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;

    const { error } = await supabase.from("subjects").delete().eq("id", subjectId);

    if (error) {
      toast.error("Failed to delete subject");
      console.error(error);
    } else {
      toast.success("Subject deleted");
      loadSubjects();
    }
  };

  const handleStartSession = (subjectId: string) => {
    navigate(`/admin/session/${subjectId}`);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading subjects...</div>;
  }

  if (subjects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No subjects yet. Click "Add Subject" to create your first one.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id} className="p-6 space-y-4 hover:shadow-glow transition-shadow">
            <div>
              <h3 className="text-xl font-bold">{subject.name}</h3>
              <p className="text-sm text-muted-foreground">CRN: {subject.crn_number}</p>
              <p className="text-sm text-muted-foreground">{subject.day_time}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleStartSession(subject.id)}
                className="flex-1 bg-gradient-primary"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setHistorySubject(subject)}
                title="View session history"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => handleDelete(subject.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {historySubject && (
        <SessionHistoryDialog
          isOpen={!!historySubject}
          onClose={() => setHistorySubject(null)}
          subjectId={historySubject.id}
          subjectName={historySubject.name}
        />
      )}
    </>
  );
};
