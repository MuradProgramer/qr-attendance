import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, UserCheck } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  crn: z.string().min(1, "CRN number is required").max(50),
});

type FormData = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  qrData: string;
  onSuccess: () => void;
}

export const RegistrationForm = ({ qrData, onSuccess }: RegistrationFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log("Form submitted:", { ...data, qrData });
      
      setIsSubmitted(true);
      toast.success("Registration completed successfully!");
      
      // Call onSuccess after a brief delay to show the success message
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md p-8 text-center space-y-4 shadow-glow">
          <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
          <h2 className="text-2xl font-bold">Registration Complete!</h2>
          <p className="text-muted-foreground">
            Your information has been successfully submitted.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md p-6 shadow-glow">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <UserCheck className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Registration Form</h2>
            <p className="text-sm text-muted-foreground">
              Please fill in your details
            </p>
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
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
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
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
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
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              QR Code: {qrData.substring(0, 20)}
              {qrData.length > 20 ? "..." : ""}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
