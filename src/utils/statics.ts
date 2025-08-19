import moment from "moment-jalaali";

export interface IVehicleType {
  id: number;
  name: string;
}

export const carTipTypes: SelectOption[] = [
  { value: 1, label: "6 تن" },
  { value: 2, label: "8 تن" },
  { value: 3, label: "5 تن" },
  { value: 4, label: "P700" },
];
export const carCompany: SelectOption[] = [
  { value: 1, label: "ایسوزو" },
  { value: 2, label: "شیلر" },
  { value: 3, label: "هیوندا" },
];
export const expertLevelOptions: SelectOption[] = [
  { value: 1, label: "مبتدی" },
  { value: 2, label: "متخصص" },
];
export const workHours = Array.from({ length: 9 }, (_, i) => i);
export const users = ["حمیدرضا", "زهرا", "مهدی"];
export const days = Array.from({ length: 20 }, (_, i) =>
  moment().add(i, "day").format("YYYY/MM/DD")
);
export const CompressLevelStatic = {
  // [Description("کیفیت بالا - حجم کم‌تر از 10% اصل")]
  // HighQuality_10Percent = 1,

  // [Description("کیفیت خوب - حجم کم‌تر از 20% اصل")]
  // GoodQuality_20Percent = 2,

  // [Description("کیفیت متوسط - حجم کم‌تر از 30% اصل")]
  // MediumQuality_30Percent = 3,

  // [Description("کیفیت پایین - حجم کم‌تر از 50% اصل")]
  // LowQuality_50Percent = 4,

  // [Description("حداکثر فشرده‌سازی - حجم کم‌تر از 70% اصل")]
  // MaxCompression_70Percent = 5
  highQuality_10: 1,
  GoodQuality_20: 2,
  MediumQuality_30: 3,
  LowQuality_50: 4,
  MaxCompression_70: 5,
};
