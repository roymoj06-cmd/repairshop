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
