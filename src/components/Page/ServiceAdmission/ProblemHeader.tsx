import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useState } from "react";

import { updateProblemIsTested } from "@/service/repairServices/repairServices.service";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import { addCommas, formatTimeDisplay } from "@/utils";
import { Button, ConfirmDialog } from "@/components";

interface ProblemHeaderProps {
  repairReceptionId?: string;
  problem: ProblemsService;
  problemIndex: number;
  readOnly?: boolean;
}
const ProblemHeader: React.FC<ProblemHeaderProps> = ({
  repairReceptionId,
  problemIndex,
  problem,
  readOnly = false,
}) => {
  const [testConfirm, setTestConfirm] = useState<{
    open: boolean;
    testResult: boolean | null;
  }>({
    open: false,
    testResult: null,
  });
  const queryClient = useQueryClient();
  const allServicesCompleted = problem.services?.every(
    (service: Service) => service.statusId === 3
  );

  // Check if problem has been tested
  const isProblemTested = problem.isTested !== undefined;
  const isTestSuccessful = problem.isTested === true;
  const updateTestMutation = useMutation({
    mutationFn: updateProblemIsTested,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["repairReceptionServices", repairReceptionId],
      });
      if (data?.isSuccess) {
        toast.success(
          testConfirm.testResult
            ? "تست مشکل با موفقیت ثبت شد"
            : "رد تست با موفقیت ثبت شد"
        );
      } else {
        toast.error(data?.message || "خطا در ثبت تست");
      }
      setTestConfirm({ open: false, testResult: null });
    },
    onError: () => {
      toast.error("خطا در ثبت تست");
      setTestConfirm({ open: false, testResult: null });
    },
  });

  const handleTestConfirm = () => {
    if (testConfirm.testResult !== null) {
      updateTestMutation.mutate({
        isTested: testConfirm.testResult,
        problemId: problem.problemId,
      });
    }
  };

  const handleTestClick = (testResult: boolean) => {
    setTestConfirm({
      open: true,
      testResult,
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-3 sm:p-4 md:p-6">
      {/* Main Header Content */}
      <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3">
        {/* Problem Info Section */}
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

        {/* Price Section */}
        {!readOnly && (
          <div className="text-left sm:text-right flex-shrink-0">
            <div className="text-white text-xs sm:text-sm opacity-90 mb-1 whitespace-nowrap">
              قیمت کل مشکل
            </div>
            <div className="text-sm sm:text-lg md:text-2xl font-bold text-white">
              {addCommas(problem.totalProblemPrice)} ریال
            </div>
          </div>
        )}
      </div>

      {/* Tester Buttons Section - Separate Row */}
      {!readOnly && (
        <AccessGuard accessId={ACCESS_IDS.TEST_REPAIR}>
          <div className="border-t border-white/20 pt-3 mt-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-white text-xs sm:text-sm opacity-90">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm">
                  {isProblemTested ? (
                    isTestSuccessful ? (
                      <span className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 px-3 py-1.5 rounded-lg">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="font-semibold">✅ تست مشکل با موفقیت انجام شد</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 px-3 py-1.5 rounded-lg">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="font-semibold">❌ تست مشکل ناموفق بود</span>
                      </span>
                    )
                  ) : allServicesCompleted ? (
                    <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-3 py-1.5 rounded-lg">
                      <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                      <span className="font-semibold">🚀 همه سرویس‌ها تکمیل شده - آماده تست</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700 px-3 py-1.5 rounded-lg">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                      <span className="font-semibold">⏳ در انتظار تکمیل سرویس‌ها</span>
                    </span>
                  )}
                </span>
              </div>
              {!isProblemTested && (
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    onClick={() => handleTestClick(true)}
                    disabled={!allServicesCompleted}
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: "rgba(34, 197, 94, 0.9) !important",
                      "&:hover": {
                        backgroundColor: "rgba(34, 197, 94, 1) !important",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      },
                      "&:disabled": {
                        backgroundColor: "rgba(34, 197, 94, 0.4) !important",
                        color: "rgba(255, 255, 255, 0.5) !important",
                        cursor: "not-allowed",
                      },
                      minWidth: "100px",
                      padding: "8px 16px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      transition: "all 0.2s ease-in-out",
                      color: "white !important",
                    }}
                  >
                    تست موفق
                  </Button>
                  <Button
                    onClick={() => handleTestClick(false)}
                    disabled={!allServicesCompleted}
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: "rgba(239, 68, 68, 0.9) !important",
                      "&:hover": {
                        backgroundColor: "rgba(239, 68, 68, 1) !important",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      },
                      "&:disabled": {
                        backgroundColor: "rgba(239, 68, 68, 0.4) !important",
                        color: "rgba(255, 255, 255, 0.5) !important",
                        cursor: "not-allowed",
                      },
                      minWidth: "100px",
                      padding: "8px 16px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      transition: "all 0.2s ease-in-out",
                      color: "white !important",
                    }}
                  >
                    تست ناموفق
                  </Button>
                </div>
              )}
            </div>
          </div>
        </AccessGuard>
      )}

      {/* Test Confirmation Dialog */}
      {!readOnly && (
        <ConfirmDialog
          open={testConfirm.open}
          onCancel={() => setTestConfirm({ open: false, testResult: null })}
          onConfirm={handleTestConfirm}
          title="تایید تست مشکل"
          message={
            testConfirm.testResult
              ? `آیا مطمئن هستید که تست این مشکل موفقیت‌آمیز بوده است؟ مشکل: ${problem.problemDescription}`
              : `آیا مطمئن هستید که تست این مشکل ناموفق بوده و مشکل همچنان پابرجاست؟ مشکل: ${problem.problemDescription}`
          }
          loading={updateTestMutation.isPending}
        />
      )}
    </div>
  );
};

export default ProblemHeader;
