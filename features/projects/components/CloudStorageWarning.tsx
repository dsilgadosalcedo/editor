"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export const CloudStorageWarning = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <Alert variant="warning" className="mb-6 relative">
      <AlertTriangle className="h-4 w-4" />
      <div className="absolute top-3 right-2">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-yellow-200 dark:hover:bg-yellow-800"
          onClick={() => setIsDismissed(true)}
        >
          <X />
        </Button>
      </div>
      <AlertTitle>Save Your Projects in the Cloud</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm">
            Your projects are currently saved locally and could be lost if you
            clear your browser data. Sign in to access them from any device.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
