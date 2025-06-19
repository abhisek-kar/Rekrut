import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Label } from "@/components/shadcn-ui/label";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { ApplicationData } from "../MultiStepApplicationForm";
import { HelpCircle, AlertCircle } from "lucide-react";

interface ScreeningQuestionsStepProps {
  data: ApplicationData;
  updateData: (updates: Partial<ApplicationData>) => void;
  job?: {
    _id: string;
    title: string;
    company: string;
    screeningQuestions?: Array<{
      id: string;
      question: string;
      required: boolean;
    }>;
  };
}

const ScreeningQuestionsStep: React.FC<ScreeningQuestionsStepProps> = ({
  data,
  updateData,
  job,
}) => {
  const screeningQuestions = job?.screeningQuestions || [];

  const handleAnswerChange = (questionId: string, answer: string) => {
    const currentAnswers = data.screeningAnswers || {};
    const updatedAnswers = {
      ...currentAnswers,
      [questionId]: answer,
    };
    updateData({ screeningAnswers: updatedAnswers });
  };

  // Check if all required questions are answered
  const getUnansweredQuestions = () => {
    const answers = data.screeningAnswers || {};
    return screeningQuestions.filter(
      (q) => q.required && (!answers[q.id] || answers[q.id].trim().length === 0)
    );
  };

  const unansweredQuestions = getUnansweredQuestions();
  const isValid = unansweredQuestions.length === 0;

  // If no screening questions, show a message
  if (screeningQuestions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Screening Questions
            </CardTitle>
            <CardDescription>
              Additional questions for this position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No additional screening questions for this position.</p>
              <p className="text-sm mt-2">You can proceed to the next step.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Screening Questions
          </CardTitle>
          <CardDescription>
            Please answer the following questions about your application for the{" "}
            {job?.title} position.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Instructions */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-foreground">
                Please provide thoughtful answers to help us understand your
                qualifications and interest in this role. Questions marked with{" "}
                <span className="text-destructive">*</span> are required.
              </p>
            </div>

            {/* Questions */}
            {screeningQuestions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <Label className="flex items-center gap-2 text-base">
                  <span className="text-muted-foreground">Q{index + 1}.</span>
                  {question.question}
                  {question.required && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>

                <Textarea
                  value={data.screeningAnswers?.[question.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  placeholder="Type your answer here..."
                  className="min-h-24 resize-y"
                  rows={3}
                />

                <div className="text-xs text-muted-foreground">
                  {data.screeningAnswers?.[question.id]?.length || 0} characters
                </div>
              </div>
            ))}

            {/* Validation message */}
            {unansweredQuestions.length > 0 && (
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Required Questions Not Answered
                    </p>
                    <p className="text-sm text-destructive/80 mt-1">
                      Please answer the following required questions:
                    </p>
                    <ul className="text-sm text-destructive/80 mt-2 list-disc list-inside">
                      {unansweredQuestions.map((q, idx) => (
                        <li key={q.id}>
                          Q
                          {screeningQuestions.findIndex(
                            (sq) => sq.id === q.id
                          ) + 1}
                          : {q.question.substring(0, 50)}
                          {q.question.length > 50 ? "..." : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Success message */}
            {isValid && screeningQuestions.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-sm font-medium text-green-800">
                    All screening questions have been answered successfully!
                  </p>
                </div>
              </div>
            )}

            {/* Progress indicator */}
            <div className="text-sm text-muted-foreground text-center">
              {screeningQuestions.length - unansweredQuestions.length} of{" "}
              {screeningQuestions.length} questions answered
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreeningQuestionsStep;
