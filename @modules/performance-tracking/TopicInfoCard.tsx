import React, { FC } from "react";
import cn from "classnames";
import Button from "@/@shared/ui/Button";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { PerformanceTrackingParsingData } from "@/dto/performane-tracking.dto";

interface Props {
  title: string;
  data: string[];
  status: "pass" | "fail";
  groupedQuestions: Record<
    string,
    Record<"correct" | "wrong", PerformanceTrackingParsingData[]>
  >;
  handleGenerateQuestions: () => void;
}

const TopicInfoCard: FC<Props> = ({
  data,
  title,
  status,
  groupedQuestions,
  handleGenerateQuestions
}) => {
  const rootClassNames = cn(
    `w-full max-w-[350px] border border-grey-200 shadow-xl rounded-xl  flex h-[500px]`
    // {
    //   ["border-[#FADCDC]"]: status === "fail",
    //   ["border-[#c3e6cb]"]: status === "pass",
    // }
  );

  const getNoDataMessage = () => {
    if (status === "fail") return "No topics failed";
    return "No topics passed";
  };

  return (
    <div className={rootClassNames}>
      <div className=" w-full">
        {status === "pass" && (
          <h3 className="text-center text-[#198754] h-[10%] mb-4 p-4 font-medium">
            {title}
          </h3>
        )}
        {status === "fail" && (
          <h3 className="text-center text-[#D24E4E] h-[10%] mb-4 p-4 font-medium">
            {title}
          </h3>
        )}

        <div className="flex flex-col gap-6 h-[65%] overflow-y-auto no-scrollbar w-full">
          {data.length ? (
            data.map((t, idx) => {
              const wrongCount = groupedQuestions[t].wrong.length;
              const correctCount = groupedQuestions[t].correct.length;
              const totalCount =
                groupedQuestions[t.toLowerCase()].wrong.length +
                groupedQuestions[t.toLowerCase()].correct.length;
              return (
                <p className="px-4 text-xs w-full" key={idx}>
                  {idx + 1}. {capitalizeFirstLetterOfEachWord(t)}{" "}
                  {status === "fail" && (
                    <span className="text-xs font-semibold text-gray-300">
                      {" "}
                      - {wrongCount} out of {totalCount}
                    </span>
                  )}
                  {status === "pass" && (
                    <span className="text-xs font-semibold text-gray-300">
                      {" "}
                      - {correctCount} out of {totalCount}
                    </span>
                  )}
                </p>
              );
            })
          ) : (
            <span className="text-center text-gray-300 py-4 text-sm">
              {getNoDataMessage()}
            </span>
          )}
        </div>

        <div className="h-[35%] px-4 pt-6">
          <p className="italic text-xs text-center mb-1">
            {status === "pass"
              ? "Stregthen your understanding on topics passed"
              : "Sharpen your skills on topics failed"}
          </p>
          <Button
            title={"New Questions"}
            fullWidth
            variant={status === "fail" ? "contained" : "outlined"}
            size="large"
            onClick={handleGenerateQuestions}
          />
        </div>
      </div>
    </div>
  );
};

export default TopicInfoCard;
