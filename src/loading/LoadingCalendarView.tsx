import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { ChevronLeft, ChevronRight, Plus, MoreHorizontal, FileText } from 'lucide-react';

export const LoadingCalendarView = () => {
  return (
    <Card>
      <CardHeader className="flex items-center">
        <div className="grid grid-cols-3 place-items-center w-[390px]">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          <CardTitle className="text-lg">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </CardTitle>
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-2 text-center text-sm font-medium">
              <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[100px] p-2 border rounded-lg"
            >
              <div className={`text-sm font-medium mb-1`}>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-1">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div
                    key={j}
                    className="group relative"
                  >
                    <div className="text-xs p-1 bg-gray-100 rounded">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mt-1" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};