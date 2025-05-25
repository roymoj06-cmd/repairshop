import { FC, SetStateAction, Dispatch } from "react";

import { fixNumbers, getPlateBackgroundColor } from "@/utils";

interface IPlateNumberDisplayProps {
  setState?: Dispatch<SetStateAction<plateSection>>;
  setPage?: Dispatch<SetStateAction<any>>;
  plateSection1?: string;
  plateSection2?: string;
  plateSection3?: string;
  plateSection4?: string;
  state?: plateSection;
  carCompany?: string;
  carTipId?: number;
}

const PlateNumberDisplay: FC<IPlateNumberDisplayProps> = ({
  plateSection1,
  plateSection2,
  plateSection3,
  plateSection4,
  setState,
  setPage,
  state,
}) => {
  const handleInputChange = (value: string | undefined, section: string) => {
    if (setState) {
      const valueFormatted = fixNumbers(value);
      setState((prevState) => ({
        ...prevState,
        [section]: valueFormatted || "",
      }));
    }
  };
  const backgroundColor = getPlateBackgroundColor(plateSection2 || "");

  return (
    <div className="plate-container" style={{ backgroundColor }}>
      <div className="plate-section">
        <div className="plate-section-content">
          <div className="text-center text-black">ایران</div>
          <div className="plate-number text-center">
            {plateSection4 ? (
              <p className="text-black">{plateSection4}</p>
            ) : (
              <input
                className="w-100 border-0 outline-none font-14 text-center dir-ltr"
                onChange={(e) => {
                  if (e.target.value === "") {
                    handleInputChange(undefined, "plateSection4");
                    setPage?.({ page: "1" });
                  } else {
                    handleInputChange(e.target.value, "plateSection4");
                    setPage?.({ page: "1" });
                  }
                }}
                value={state?.plateSection4 || ""}
                style={{ height: "15px", maxWidth: "35px" }}
                placeholder="99"
                maxLength={2}
                minLength={2}
                type="text"
              />
            )}
          </div>
        </div>
      </div>
      <div className="plate-numbers">
        {plateSection1 ? (
          <p className="text-black">{plateSection1}</p>
        ) : (
          <input
            onChange={(e) => {
              if (e.target.value === "") {
                handleInputChange(undefined, "plateSection1");
                setPage?.({ page: "1" });
              } else {
                handleInputChange(e.target.value, "plateSection1");
                setPage?.({ page: "1" });
              }
            }}
            style={{ maxWidth: "28px" }}
            className="w-100 border-0 outline-none font-14 text-center dir-ltr"
            value={state?.plateSection1 || ""}
            placeholder="99"
            maxLength={2}
            minLength={2}
            type="text"
          />
        )}
        {plateSection2 ? (
          <p className="text-black">{plateSection2}</p>
        ) : (
          <input
            className="w-100 border-0 outline-none font-14 text-center dir-ltr"
            onChange={(e) => {
              if (e.target.value === "") {
                handleInputChange(undefined, "plateSection2");
                setPage?.({ page: "1" });
              } else {
                handleInputChange(e.target.value, "plateSection2");
                setPage?.({ page: "1" });
              }
            }}
            style={{ maxWidth: "15px" }}
            value={state?.plateSection2 || ""}
            placeholder="ع"
            maxLength={1}
            minLength={1}
            type="text"
          />
        )}
        {plateSection3 ? (
          <p className="text-black">{plateSection3}</p>
        ) : (
          <input
            onChange={(e) => {
              if (e.target.value === "") {
                handleInputChange(undefined, "plateSection3");
                setPage?.({ page: "1" });
              } else {
                handleInputChange(e.target.value, "plateSection3");
                setPage?.({ page: "1" });
              }
            }}
            style={{ maxWidth: "33px" }}
            className="w-100 border-0 outline-none font-14 text-center dir-ltr"
            value={state?.plateSection3 || ""}
            placeholder="999"
            maxLength={3}
            minLength={3}
            type="text"
          />
        )}
      </div>
      <div className="plate-flag">
        <img
          alt="FLAG_OF_IRAN"
          className="flag-image m-auto"
          src="/images/iran.png"
        />
        <span className="flag-text">I.R.</span>
        <span className="flag-text">IRAN</span>
      </div>
    </div>
  );
};

export default PlateNumberDisplay;
