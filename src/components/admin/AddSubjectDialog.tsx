import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../integrations/supabase/client.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";

const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  crnNumber: z.string().min(1, "CRN number is required"),
  dayTime: z.string().min(1, "Day and time is required"),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface AddSubjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const AddSubjectDialog = ({ isOpen, onClose, userId }: AddSubjectDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
  });

  const onSubmit = async (data: SubjectFormData) => {
    const { error } = await supabase.from("subjects").insert({
      teacher_id: userId,
      name: data.name,
      crn_number: data.crnNumber,
      day_time: data.dayTime,
    });

    if (error) {
      toast.error("Failed to add subject");
      console.error(error);
    } else {
      toast.success("Subject added successfully");
      reset();
      onClose();
      window.location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              placeholder="e.g., Mathematics 101"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="crnNumber">CRN Number</Label>
            <Input
              id="crnNumber"
              placeholder="e.g., 12345"
              {...register("crnNumber")}
              className={errors.crnNumber ? "border-destructive" : ""}
            />
            {errors.crnNumber && (
              <p className="text-sm text-destructive">{errors.crnNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dayTime">Day & Time</Label>
            <Input
              id="dayTime"
              placeholder="e.g., Monday 10:00 AM"
              {...register("dayTime")}
              className={errors.dayTime ? "border-destructive" : ""}
            />
            {errors.dayTime && (
              <p className="text-sm text-destructive">{errors.dayTime.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-primary"
            >
              {isSubmitting ? "Adding..." : "Add Subject"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
