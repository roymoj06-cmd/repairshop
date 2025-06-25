import Cookies from "js-cookie";
import { toast } from "react-toastify";

export const getToken = () => {
  if (Cookies.get("token")) {
    return Cookies.get("token");
  }
};
export const getSessionCustomerToken = () => {
  if (sessionStorage?.getItem("customerToken")) {
    return sessionStorage?.getItem("customerToken");
  }
};
export const useAuth = () => {
  return Cookies.get("token");
};
export const checkLogin = () => {
  return !!Cookies.get("token");
};
export const p2e = (s: any) =>
  s?.replace(/[۰-۹]/g, (d: any) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

export const convertGeorginaToJalali = (date: string | Date) => {
  const months = [
    "فروردين",
    "ارديبهشت",
    "خرداد",
    "تير",
    "مرداد",
    "شهريور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];
  const [year, month, day] = new Date(date)
    .toLocaleDateString("fa-IR")
    .split("/");
  const [hours, minutes] = new Date(date)
    .toLocaleTimeString("fa-IR")
    .split(":");

  return (
    year &&
    month &&
    day &&
    `${day} ${months[+p2e(month) - 1]} ${year} ساعت ${hours}:${minutes}`
  );
};
export const convertToEnglishDigits = (number: string | number) => {
  return number
    ?.toString()
    ?.replace(/۰/g, "0")
    ?.replace(/۱/g, "1")
    ?.replace(/۲/g, "2")
    ?.replace(/۳/g, "3")
    ?.replace(/۴/g, "4")
    ?.replace(/۵/g, "5")
    ?.replace(/۶/g, "6")
    ?.replace(/۷/g, "7")
    ?.replace(/۸/g, "8")
    ?.replace(/۹/g, "9");
};
export const convertUserTypeToSpell = (
  userType?: number | string
): "mechanic" | "endUser" | "coWorker" | "supplier" | "system" => {
  const userTypeMap: Record<
    number | string,
    "mechanic" | "endUser" | "coWorker" | "supplier" | "system"
  > = {
    8: "mechanic",
    1: "endUser",
    7: "coWorker",
    2: "system",
    23: "supplier",
  };
  return userType !== undefined
    ? userTypeMap[userType] || "endUser"
    : "endUser"; // +
};
export const convertObjectToQueryStringBaloch = ({
  arrayQuery,
  name,
}: {
  arrayQuery?: Array<number | string>;
  name: string;
}) => {
  if (arrayQuery) return arrayQuery?.map((val) => `${name}=${val}`).join("&");
  else return "";
};
export const convertGeorginaToJalaliWithoutTime = (date: string) => {
  const months = [
    "فروردين",
    "ارديبهشت",
    "خرداد",
    "تير",
    "مرداد",
    "شهريور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];
  const [year, month, day] = new Date(date)
    .toLocaleDateString("fa-IR")
    .split("/");

  return year && month && day && `${day} ${months[+p2e(month) - 1]} ${year}`;
};
export const convertGeorginaToTimeOnly = (date: string) => {
  const [hours, minutes] = new Date(date)
    .toLocaleTimeString("fa-IR")
    .split(":");
  return `${hours}:${minutes}`;
};
export const createFormData = (propList: Record<string, any>) => {
  const formDate = new FormData();
  Object.keys(propList).forEach((key: string) => {
    formDate.append(key, propList[key]);
  });
  return formDate;
};
export const createFormDataBlobFileVoices = async (
  propList: Record<string, any>
) => {
  const formDate = new FormData();
  const blob = await fetch(propList[0]).then((r) => r.blob());
  Object.keys(propList).forEach((key: string) => {
    formDate.append(
      key,
      new File([blob], "audiofile.wav", {
        type: "audio/wav",
      })
    );
  });
  return formDate;
};
export const convertObjectToQueryString = (obj: Record<string, any>) => {
  return Object.entries(obj)
    .filter(([, value]) => value !== undefined)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");
};
export const removeUndefinedPropertyFromObject = (obj: Record<string, any>) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
};
export const checkNumber0to100 = (value: string) => {
  const pattern = /^[1-9][0-9]?$|^100$/;
  if (value.length > 0 && +value !== 0) {
    return !!pattern.test(value);
  }
};
export const isNumber = (val: number) => {
  return val === +val;
};
export const addCommas = (nStr: string | number) => {
  nStr += "";
  const x = nStr.toString().split(".");
  let x1 = x[0];
  const x2 = x.length > 1 ? "." + x[1] : "";
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + "," + "$2");
  }
  return x1 + x2;
  // return Intl.NumberFormat('fa').format(+nStr)
};
export const addCommasAndUnitPrice = (nStr: string | number) => {
  const numberByComma = addCommas(nStr);
  return `${numberByComma} ریال`;
};
export const getDateInFormatForBackFilterDate = () => {
  function toString(number: number, padLength: number) {
    return number.toString().padStart(padLength, "0");
  }
  const date: Date = new Date();
  const dateTimeNow =
    toString(date.getFullYear(), 4) +
    "/" +
    toString(date.getMonth() + 1, 2) +
    "/" +
    toString(date.getDate(), 2) +
    " " +
    toString(date.getHours(), 2) +
    ":" +
    toString(date.getMinutes(), 2) +
    ":" +
    toString(date.getSeconds(), 2);

  return dateTimeNow;
};
export const getDateInFormatForBackFilterDateStartToday = () => {
  function toString(number: number, padLength: number) {
    return number.toString().padStart(padLength, "0");
  }
  const date: Date = new Date();
  const dateTimeNow =
    toString(date.getFullYear(), 4) +
    "/" +
    toString(date.getMonth() + 1, 2) +
    "/" +
    toString(date.getDate(), 2) +
    " " +
    "00:00:00";

  return dateTimeNow;
};
export const isNullOrUndefined = (value: any) => {
  return value === undefined || value === null;
};
export const convertorVehicleType = (id: string | null) => {
  const vehicleTypes: Record<string, string> = {
    "7": "6 - 8 تن",
    "6": "5 تن",
    "5": "700 پی",
  };

  return id ? vehicleTypes[id] : undefined;
};
export const convertGeorginaToJalaliOnlyDayByNumber = (date: any) => {
  const [year, month, day] = new Date(date)
    .toLocaleDateString("fa-IR")
    .split("/");
  return `${day} / ${month} / ${year} `;
};
export const checkAccessToMenu = ({ id, accessOperations }: any) => {
  if (accessOperations.includes(id)) {
    return true;
  } else {
    return false;
  }
};
export const copyContent = async (content: any) => {
  try {
    await navigator.clipboard.writeText(`${content}`);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};
export const getIndexRowInPagination = ({
  pageQuery,
  pageSize,
  index,
}: {
  pageQuery: string | number;
  pageSize: string | number;
  index: number;
}) => {
  return +pageQuery * +pageSize - +pageSize + index + 1;
};
const persianNumbers = [
  /۰/g,
  /۱/g,
  /۲/g,
  /۳/g,
  /۴/g,
  /۵/g,
  /۶/g,
  /۷/g,
  /۸/g,
  /۹/g,
];
const arabicNumbers = [
  /٠/g,
  /١/g,
  /٢/g,
  /٣/g,
  /٤/g,
  /٥/g,
  /٦/g,
  /٧/g,
  /٨/g,
  /٩/g,
];
export const fixNumbers = (str: any) => {
  if (typeof str === "string") {
    for (let i = 0; i < 10; i++) {
      str = str.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);
    }
  }
  return str;
};
// تصحیح رشته ها مانند نام
export const fixText = (text: string): string => {
  if (text === undefined || text == null) {
    return text;
  } else {
    return text
      .toString()
      .replace(/٬/g, ",")
      .replace(/۰/g, "0")
      .replace(/۱/g, "1")
      .replace(/۲/g, "2")
      .replace(/۳/g, "3")
      .replace(/۴/g, "4")
      .replace(/۵/g, "5")
      .replace(/۶/g, "6")
      .replace(/۷/g, "7")
      .replace(/۸/g, "8")
      .replace(/۹/g, "9")
      .replace(/ك/g, "ک")
      .replace(/ي/g, "ی");
  }
};
export const removeComma = (convert: string) => {
  return convert.split(",").join("");
};
export const persianCompare = (a: string, b: string): number => {
  const persianAlphabet = [
    "آ",
    "ا",
    "ب",
    "پ",
    "ت",
    "ث",
    "ج",
    "چ",
    "ح",
    "خ",
    "د",
    "ذ",
    "ر",
    "ز",
    "ژ",
    "س",
    "ش",
    "ص",
    "ض",
    "ط",
    "ظ",
    "ع",
    "غ",
    "ف",
    "ق",
    "ک",
    "گ",
    "ل",
    "م",
    "ن",
    "و",
    "ه",
    "ی",
  ];

  const getCharIndex = (char: string): number => {
    return persianAlphabet.indexOf(char);
  };

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const aIndex = getCharIndex(a[i]);
    const bIndex = getCharIndex(b[i]);
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
  }
  return a.length - b.length;
};
export const daysSinceUTC = (targetDate: string) => {
  const target: Date = new Date(targetDate);
  const now: Date = new Date();
  // محاسبه تعداد میلی‌ثانیه‌ها از تاریخ ورودی تا تاریخ فعلی
  const millisecondsDiff: number = now.getTime() - target.getTime();
  // محاسبه تعداد روزها
  const daysDiff: number = Math.floor(millisecondsDiff / (1000 * 60 * 60 * 24));
  return daysDiff;
};
export const checkAndReturnWatchHookForm = <T>({
  watchData,
  defaultValue,
}: {
  watchData: T;
  defaultValue: T;
}): T | undefined => {
  return watchData === "" ? undefined : watchData || defaultValue;
};

export const downloadFile = (response: any, defaultFilename: string) => {
  try {
    // Check if the response is what we expect
    if (!response) {
      throw new Error("No response received from server");
    }

    // Determine the content type
    const contentType =
      response.headers?.["content-type"] || "application/octet-stream";
    console.log({ response });
    // Create blob
    const blob = new Blob([response], { type: contentType });

    // Create download URL
    const downloadUrl = window.URL.createObjectURL(blob);

    // Create and click download link
    const link = document.createElement("a");
    link.href = downloadUrl;

    // Determine filename
    let filename = defaultFilename;
    const contentDisposition = response.headers?.["content-disposition"];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=(.+)/);
      if (filenameMatch) {
        filename = filenameMatch[1].replace(/['"]/g, "");
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(downloadUrl);

    toast.success("فایل با موفقیت دانلود شد");
  } catch (error: any) {
    console.error("Error downloading file:", error);
    toast.error(`خطا در دانلود فایل: ${error.message}`);
  }
};
const statusColorMapCheque = {
  0: "",
  1: "text-primary",
  2: "text-success",
  3: "text-danger",
  4: "text-warning",
  5: "text-info",
  6: "text-secondary",
  7: "text-secondary",
};

export const getStatusClassCheque = (statusId: number): string => {
  return (
    statusColorMapCheque[statusId as keyof typeof statusColorMapCheque] || ""
  );
};
export const checkInputChange = (value: string) => {
  if (value && value !== "") {
    return value;
  } else {
    return undefined;
  }
};
export const getFileSource = (fileId: number) => {
  return `${import.meta.env.VITE_APP_FILE_URL}${fileId}`;
};
export const getPlateBackgroundColor = (letter: string): string => {
  const colorMap: { [key: string]: string } = {
    ع: "#f1d907",
    // Add more mappings as needed
  };

  return colorMap[letter] || "#fff";
};
export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours} ساعت${
      remainingMinutes > 0 ? ` و ${remainingMinutes} د` : ""
    }`;
  }
  return `${remainingMinutes} دقیقه`;
};
export const calculateDaysPassed = (gregorianDate: string): string => {
  const targetDate = new Date(gregorianDate);
  const now = new Date();

  // Calculate the difference in milliseconds
  const millisecondsDiff = now.getTime() - targetDate.getTime();

  // Convert milliseconds to days and round down
  const daysPassed = Math.floor(millisecondsDiff / (1000 * 60 * 60 * 24));

  return `${daysPassed} روز پیش`;
};
export const formatTimeWithZero = (value: string | undefined): string => {
  if (!value) return "00";
  return value.toString().length > 1 ? `${value}` : `0${value}`;
};
