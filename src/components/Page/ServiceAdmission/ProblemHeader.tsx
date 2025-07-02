import { addCommas, formatTimeDisplay } from "@/utils";

interface ProblemHeaderProps {
  problem: ProblemsService;
  problemIndex: number;
}

const ProblemHeader: React.FC<ProblemHeaderProps> = ({
  problem,
  problemIndex,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-3 sm:p-4 md:p-6">
      <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm sm:text-base md:text-lg">
              {problemIndex + 1}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base md:text-xl font-bold text-white mb-1 leading-tight">
              مشکل: {problem.problemDescription}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-blue-100">
              <span className="text-xs sm:text-sm whitespace-nowrap">
                تعداد سرویس‌ها: {problem.services?.length || 0}
              </span>
              <span className="text-xs sm:text-sm whitespace-nowrap">
                زمان کل: {formatTimeDisplay(problem.totalEstimatedMinutes)}
              </span>
            </div>
          </div>
        </div>
        <div className="text-left sm:text-right flex-shrink-0">
          <div className="text-white text-xs sm:text-sm opacity-90 mb-1 whitespace-nowrap">
            قیمت کل مشکل
          </div>
          <div className="text-sm sm:text-lg md:text-2xl font-bold text-white">
            {addCommas(problem.totalProblemPrice)} ریال
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemHeader;
