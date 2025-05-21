declare module "*.scss" {
  const content: {
    [className: string]: string;
    primaryColorOne: string;
    primaryColorTwo: string;
    primaryColorThree: string;
    secondaryColorOne: string;
    secondaryColorTwo: string;
    dangerColor: string;
    goldColor: string;
    activeColor: string;
    successColor: string;
  };
  export default content;
}
