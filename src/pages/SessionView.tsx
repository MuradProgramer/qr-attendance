import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ArrowLeft, StopCircle, Timer } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { AttendanceList } from "../components/admin/AttendanceList";

const QR_ROTATION_INTERVAL = 10; // seconds

const SessionView = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [rotationCount, setRotationCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(QR_ROTATION_INTERVAL);

  useEffect(() => {
    if (!subjectId) return;
    loadSubject();
    startSession();
  }, [subjectId]);

  // Timer countdown effect
  useEffect(() => {
    if (!session) return;

    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return QR_ROTATION_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [session]);

  // QR rotation effect
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      rotateQRCode();
      setTimeRemaining(QR_ROTATION_INTERVAL);
    }, QR_ROTATION_INTERVAL * 1000);

    return () => clearInterval(interval);
  }, [session]);

  const loadSubject = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", subjectId || "")
      .single();

    if (error) {
      console.error("Error loading subject:", error);
      toast.error("Failed to load subject");
      navigate("/admin");
      return;
    }
    setSubject(data);
  };

  const startSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const initialToken = generateToken();
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        subject_id: subjectId || "",
        teacher_id: user.id,
        current_qr_token: initialToken,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error starting session:", error);
      toast.error("Failed to start session");
      return;
    }

    setSession(data);
    generateQRCode(data.id, initialToken);
  };

  const generateToken = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const generateQRCode = async (sessionId: string, token: string) => {
    const url = `${window.location.origin}/attend/${sessionId}/${token}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 400 });
    setQrDataUrl(dataUrl);
  };

  const rotateQRCode = async () => {
    if (!session) return;

    const newToken = generateToken();
    const newCount = rotationCount + 1;

    const { error } = await supabase
      .from("sessions")
      .update({
        current_qr_token: newToken,
        qr_rotation_count: newCount,
      })
      .eq("id", session.id);

    if (error) {
      console.error("Error rotating QR:", error);
      return;
    }

    setRotationCount(newCount);
    generateQRCode(session.id, newToken);
  };

  const stopSession = async () => {
    if (!session) return;

    const { error } = await supabase
      .from("sessions")
      .update({
        status: "stopped",
        stopped_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (error) {
      toast.error("Failed to stop session");
      console.error(error);
      return;
    }

    toast.success("Session stopped");
    navigate("/admin");
  };

  if (!subject || !session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const progressValue = (timeRemaining / QR_ROTATION_INTERVAL) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="p-6 shadow-glow">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button variant="destructive" onClick={stopSession}>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Session
            </Button>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4 shadow-glow">
            <h2 className="text-2xl font-bold">{subject.name}</h2>
            <p className="text-muted-foreground">CRN: {subject.crn_number}</p>
            <p className="text-muted-foreground">{subject.day_time}</p>
            <div className="pt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                QR Code rotations: {rotationCount}
              </p>
            </div>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center shadow-glow space-y-4">
            <h3 className="text-xl font-bold">Scan to Attend</h3>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="w-full max-w-sm animate-fade-in" />
            )}
            <div className="w-full max-w-sm space-y-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span className="font-mono text-lg font-semibold">
                  {timeRemaining}s
                </span>
              </div>
              <Progress value={progressValue} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Code refreshes in {timeRemaining} seconds
              </p>
            </div>
          </Card>
        </div>

        <AttendanceList sessionId={session.id} />
      </div>
    </div>
  );
};

export default SessionView;
