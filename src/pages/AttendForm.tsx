import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../integrations/supabase/client";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  crn: z.string().min(1, "CRN number is required").max(50),
});

type FormData = z.infer<typeof formSchema>;

const AttendForm = () => {
  const { sessionId, token } = useParams();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [subject, setSubject] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    validateSession();
  }, [sessionId, token]);

  const validateSession = async () => {
    if (!sessionId || !token) {
      setIsValid(false);
      setIsValidating(false);
      return;
    }

    const { data, error } = await supabase
      .from("sessions")
      .select("*, subjects(*)")
      .eq("id", sessionId)
      .eq("current_qr_token", token)
      .eq("status", "active")
      .single();

    if (error || !data) {
      setIsValid(false);
      setIsValidating(false);
      return;
    }

    setIsValid(true);
    setSubject(data.subjects);
    setIsValidating(false);
  };

  const onSubmit = async (data: FormData) => {
    if (!sessionId || !token) return;

    const { error } = await supabase.from("attendance").insert({
      session_id: sessionId,
      first_name: data.firstName,
      last_name: data.lastName,
      crn: data.crn,
      qr_token: token,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("You have already submitted attendance for this session");
      } else {
        toast.error("Failed to submit attendance");
        console.error(error);
      }
      return;
    }

    setIsSubmitted(true);
    toast.success("Attendance submitted successfully!");
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <p>Validating QR code...</p>
        </Card>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md p-8 text-center space-y-4 shadow-glow">
          <XCircle className="h-16 w-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold">Invalid QR Code</h2>
          <p className="text-muted-foreground">
            This QR code has expired or is invalid. Please scan the latest code.
          </p>
          <Button onClick={() => navigate("/")} className="bg-gradient-primary">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md p-8 text-center space-y-4 shadow-glow">
          <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
          <h2 className="text-2xl font-bold">Attendance Submitted!</h2>
          <p className="text-muted-foreground">
            Your attendance has been recorded for {subject?.name}.
          </p>
          <Button onClick={() => navigate("/")} className="bg-gradient-primary">
            Done
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in bg-gradient-subtle">
      <Card className="w-full max-w-md p-6 shadow-glow">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Mark Attendance</h2>
            {subject && (
              <div className="space-y-1">
                <p className="text-lg font-semibold">{subject.name}</p>
                <p className="text-sm text-muted-foreground">{subject.day_time}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter your first name"
                {...register("firstName")}
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter your last name"
                {...register("lastName")}
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="crn">CRN Number</Label>
              <Input
                id="crn"
                placeholder="Enter your CRN number"
                {...register("crn")}
                className={errors.crn ? "border-destructive" : ""}
              />
              {errors.crn && (
                <p className="text-sm text-destructive">{errors.crn.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Attendance"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AttendForm;
