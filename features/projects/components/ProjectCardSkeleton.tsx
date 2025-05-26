import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex-1 mr-2">
          <Skeleton className="h-9 w-3/4" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Skeleton className="grid place-items-center h-9 w-full rounded-md text-sm font-medium">
          Open Project
        </Skeleton>
      </CardContent>
    </Card>
  );
}
