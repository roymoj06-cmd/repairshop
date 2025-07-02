import { Add } from "@mui/icons-material";

interface AddServiceBoxProps {
  onAddService: () => void;
}

const AddServiceBox: React.FC<AddServiceBoxProps> = ({ onAddService }) => {
  return (
    <div className="mt-6">
      <div
        onClick={onAddService}
        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors duration-200">
            <Add className="text-blue-600 dark:text-blue-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            افزودن سرویس جدید
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
            برای این مشکل سرویس جدید اضافه کنید
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddServiceBox;
