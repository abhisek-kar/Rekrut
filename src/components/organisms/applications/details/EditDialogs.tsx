import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { Label } from "@/components/shadcn-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { DateTimePicker } from "@/components/shadcn-ui/date-time-picker";
import { Badge } from "@/components/shadcn-ui/badge";
import { X, Plus, User, Video, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

interface InterviewDialogProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  interview?: any;
  onSuccess: () => void;
}

interface NoteDialogProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  note?: any;
  onSuccess: () => void;
}

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  review?: any;
  onSuccess: () => void;
}

// Interview Dialog
export const InterviewDialog: React.FC<InterviewDialogProps> = ({
  open,
  onClose,
  applicationId,
  interview,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateTime: interview?.dateTime ? new Date(interview.dateTime) : new Date(),
    duration: interview?.duration || 60,
    type: interview?.type || "video",
    location: interview?.location || "",
    videoLink: interview?.videoLink || "",
    notes: interview?.notes || "",
    status: interview?.status || "scheduled",
    interviewers: interview?.interviewers || [],
  });
  const [interviewerEmail, setInterviewerEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = interview
        ? `/api/applications/${applicationId}/interviews/${interview._id}`
        : `/api/applications/${applicationId}/interviews`;

      const method = interview ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save interview");

      toast.success(
        interview
          ? "Interview updated successfully"
          : "Interview scheduled successfully"
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save interview");
    } finally {
      setLoading(false);
    }
  };

  const addInterviewer = async () => {
    if (!interviewerEmail.trim()) return;

    try {
      const response = await fetch(
        `/api/users/search?email=${interviewerEmail}`
      );
      if (!response.ok) throw new Error("User not found");

      const user = await response.json();
      setFormData((prev) => ({
        ...prev,
        interviewers: [...prev.interviewers, user],
      }));
      setInterviewerEmail("");
    } catch (error) {
      toast.error("Failed to add interviewer");
    }
  };

  const removeInterviewer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      interviewers: prev.interviewers.filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {interview ? "Edit Interview" : "Schedule Interview"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateTime">Date & Time</Label>
              <DateTimePicker
                value={formData.dateTime}
                onChange={(date: Date) =>
                  setFormData((prev) => ({ ...prev, dateTime: date }))
                }
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value),
                  }))
                }
                min="15"
                step="15"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Interview Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center">
                      <Video className="w-4 h-4 mr-2" />
                      Video Call
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Call
                    </div>
                  </SelectItem>
                  <SelectItem value="onsite">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      On-site
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.type === "video" && (
            <div>
              <Label htmlFor="videoLink">Video Link</Label>
              <Input
                id="videoLink"
                value={formData.videoLink}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    videoLink: e.target.value,
                  }))
                }
                placeholder="https://zoom.us/j/..."
              />
            </div>
          )}

          {formData.type === "onsite" && (
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Conference Room A, Floor 3"
              />
            </div>
          )}

          <div>
            <Label>Interviewers</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={interviewerEmail}
                onChange={(e) => setInterviewerEmail(e.target.value)}
                placeholder="interviewer@company.com"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addInterviewer())
                }
              />
              <Button type="button" onClick={addInterviewer} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.interviewers.map((interviewer: any, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <User className="w-3 h-3" />
                  {interviewer.firstName} {interviewer.lastName}
                  <button
                    type="button"
                    onClick={() => removeInterviewer(index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Interview notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : interview
                ? "Update Interview"
                : "Schedule Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Note Dialog
export const NoteDialog: React.FC<NoteDialogProps> = ({
  open,
  onClose,
  applicationId,
  note,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: note?.content || "",
    visibility: note?.visibility || "internal",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setLoading(true);

    try {
      const url = note
        ? `/api/applications/${applicationId}/notes/${note._id}`
        : `/api/applications/${applicationId}/notes`;

      const method = note ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save note");

      toast.success(
        note ? "Note updated successfully" : "Note added successfully"
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "Add Note"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Note</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Add your note here..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, visibility: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Only</SelectItem>
                <SelectItem value="shared">Shared with Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.content.trim()}
            >
              {loading ? "Saving..." : note ? "Update Note" : "Add Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Review Dialog
export const ReviewDialog: React.FC<ReviewDialogProps> = ({
  open,
  onClose,
  applicationId,
  review,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: review?.rating || 3,
    strengths: review?.strengths || [],
    weaknesses: review?.weaknesses || [],
    interviewRecommendation: review?.interviewRecommendation ?? true,
    feedback: review?.feedback || "",
  });
  const [newStrength, setNewStrength] = useState("");
  const [newWeakness, setNewWeakness] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = `/api/applications/${applicationId}/review`;
      const method = review ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save review");

      toast.success(
        review ? "Review updated successfully" : "Review saved successfully"
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save review");
    } finally {
      setLoading(false);
    }
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      setFormData((prev) => ({
        ...prev,
        strengths: [...prev.strengths, newStrength.trim()],
      }));
      setNewStrength("");
    }
  };

  const addWeakness = () => {
    if (newWeakness.trim()) {
      setFormData((prev) => ({
        ...prev,
        weaknesses: [...prev.weaknesses, newWeakness.trim()],
      }));
      setNewWeakness("");
    }
  };

  const removeStrength = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      strengths: prev.strengths.filter((_: any, i: number) => i !== index),
    }));
  };

  const removeWeakness = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      weaknesses: prev.weaknesses.filter((_: any, i: number) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{review ? "Edit Review" : "Add Review"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Overall Rating</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, rating: star }))
                  }
                  className={`text-2xl ${
                    star <= formData.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Strengths</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                placeholder="Add a strength..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addStrength())
                }
              />
              <Button type="button" onClick={addStrength} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.strengths.map((strength: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1 bg-green-50"
                >
                  {strength}
                  <button
                    type="button"
                    onClick={() => removeStrength(index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Areas for Improvement</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newWeakness}
                onChange={(e) => setNewWeakness(e.target.value)}
                placeholder="Add an area for improvement..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addWeakness())
                }
              />
              <Button type="button" onClick={addWeakness} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.weaknesses.map((weakness: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1 bg-red-50"
                >
                  {weakness}
                  <button
                    type="button"
                    onClick={() => removeWeakness(index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Interview Recommendation</Label>
            <Select
              value={formData.interviewRecommendation ? "yes" : "no"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  interviewRecommendation: value === "yes",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Recommend for Interview</SelectItem>
                <SelectItem value="no">Do Not Recommend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="feedback">Additional Feedback</Label>
            <Textarea
              id="feedback"
              value={formData.feedback}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, feedback: e.target.value }))
              }
              placeholder="Additional comments or feedback..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : review ? "Update Review" : "Save Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
