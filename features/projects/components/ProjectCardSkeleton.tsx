import { Card, CardAction, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Trash2 } from "lucide-react";

export default function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex-1 mr-2">
          <Skeleton className="h-9 w-3/4" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="grid place-items-center h-9 w-9 rounded-md">
            <Info className="size-4" />
          </Skeleton>
          <Skeleton className="grid place-items-center h-9 w-9 rounded-md">
            <Trash2 className="size-4" />
          </Skeleton>
        </div>
      </CardHeader>

      <CardFooter>
        <CardAction className="w-full">
          <Skeleton className="grid place-items-center h-9 w-full rounded-md text-sm font-medium">
            Open Project
          </Skeleton>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
