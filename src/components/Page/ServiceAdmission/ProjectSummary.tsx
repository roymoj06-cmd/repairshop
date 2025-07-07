import { addCommas, formatTimeDisplay } from "@/utils";

interface ProjectSummaryProps {
  problems: ProblemsService[];
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({ problems }) => {
  const totalProblems = problems.length;
  const totalServices = problems.reduce(
    (total: number, problem: ProblemsService) =>
      total + (problem.services?.length || 0),
    0
  );
  const totalEstimatedMinutes = problems.reduce(
    (total: number, problem: ProblemsService) =>
      total + problem.totalEstimatedMinutes,
    0
  );
  const totalPrice = problems.reduce(
    (total: number, problem: ProblemsService) =>
      total + problem.totalProblemPrice,
    0
  );

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
        خلاصه کل خدمات
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalProblems}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            تعداد مشکلات
          </div>
        </div>
        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalServices}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300 mt-1">
            تعداد کل سرویس‌ها
          </div>
        </div>
        <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatTimeDisplay(totalEstimatedMinutes)}
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300 mt-1">
            زمان کل تخمینی
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
        <div className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {addCommas(totalPrice)} ریال
          </div>
          <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
            مجموع قیمت کل خدمات
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummary;
