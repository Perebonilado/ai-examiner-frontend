import AltTabContainer from "@/@shared/components/Tab/AltTabContainer";
import { useGetUserIpInfoQuery } from "@/api-services/ip.service";
import { useGetPlansQuery } from "@/api-services/plans.service";
import { PlanModel } from "@/models/plan.model";
import React, { FC, useEffect, useState } from "react";
import AfricanPlansContainer from "./AfricanPlansContainer";
import NonAfricanPlansContainer from "./NonAfricanPlansContainer";
import cn from "classnames";

const PlanContainerV2: FC = () => {
  const [africanPlanDivisions, setAfricanPlanDivisions] = useState([
    { isActive: true, title: "Monthly" },
    { isActive: false, title: "Quarterly" },
  ]);
  const [nonAfricanPlanDivisions, setNonAfricanPlanDivisions] = useState([
    { isActive: true, title: "Monthly" },
    { isActive: false, title: "Annually" },
  ]);

  const { data: ipDetails, isError: isIpDetailsError } =
    useGetUserIpInfoQuery("");
  const { data: plans, isLoading: plansLoading } = useGetPlansQuery("");
  const [africanPlans, setAfricanPlans] = useState<PlanModel[]>();
  const [nonAfricaPlans, setNonAfrica] = useState<PlanModel[]>();

  const [userIsAfrican, setUserIsAfrican] = useState<boolean | null>(null);
  const [userIsNigerian, setUserIsNigerian] = useState(false);

  useEffect(() => {
    if (plans) {
      const afriPlans = plans.filter(
        (p) => p.region.toLowerCase() === "africa"
      );
      const outsideAfri = plans.filter(
        (p) => p.region.toLowerCase() !== "africa"
      );

      if (afriPlans.length) {
        setAfricanPlans(afriPlans);
      }

      if (outsideAfri.length) {
        setNonAfrica(outsideAfri);
      }
    }
  }, [plans]);

  useEffect(() => {
    if (ipDetails) {
      if (ipDetails.timezone.toLowerCase().includes("africa")) {
        setUserIsAfrican(true);

        if (ipDetails.country.toLowerCase() === "ng") {
          setUserIsNigerian(true);
        }
      } else {
        setUserIsAfrican(false);
      }
    }
  }, [JSON.stringify(ipDetails)]);

  const handleChangePlanDivision = (
    title: string,
    region: "african" | "non-african"
  ) => {
    if (region === "african") {
      setAfricanPlanDivisions(
        africanPlanDivisions.map((pl) => {
          if (pl.title === title) {
            return { ...pl, isActive: true };
          }

          return { ...pl, isActive: false };
        })
      );
    } else {
      setNonAfricanPlanDivisions(
        nonAfricanPlanDivisions.map((pl) => {
          if (pl.title === title) {
            return { ...pl, isActive: true };
          }

          return { ...pl, isActive: false };
        })
      );
    }
  };

  return (
    <div className="bg-white mb-24">
      <div className="w-full max-w-[1000px] min-h-[600px] border mx-auto rounded-2xl overflow-hidden max-md:rounded-none max-md:border-none">
        <div className="py-10 bg-[#F7F5FF] flex flex-col justify-center p-4 max-md:text-center">
          <h3 className="text-3xl font-bold mb-1 max-md:text-2xl">
            Ready to keep practicing ?
          </h3>
          <p>For unlimited access, please select a plan below</p>
        </div>

        <div className="px-4">
          <div className="my-4 flex justify-end max-md:justify-center">
            <div className="w-fit flex items-center gap-3">
              {userIsAfrican === true && (
                <AltTabContainer
                  data={africanPlanDivisions}
                  handleClick={(t) => {
                    handleChangePlanDivision(t, "african");
                  }}
                />
              )}

              {userIsAfrican === false && (
                <>
                  <AltTabContainer
                    data={nonAfricanPlanDivisions}
                    handleClick={(t) => {
                      handleChangePlanDivision(t, "non-african");
                    }}
                  />
                  <p
                    className={cn("text-sm italic", {
                      ["text-[#8B8B8B]"]:
                        nonAfricanPlanDivisions
                          .find((d) => d.isActive)
                          ?.title.toLowerCase() === "monthly",
                      ["text-[#008650]"]:
                        nonAfricanPlanDivisions
                          .find((d) => d.isActive)
                          ?.title.toLowerCase() === "annually",
                    })}
                  >
                    save 27%
                  </p>
                </>
              )}
            </div>
          </div>

          {/* plans here */}

          {userIsAfrican === true && (
            <AfricanPlansContainer
              plans={africanPlans}
              userIsNigerian={userIsNigerian}
              currentDivision={
                africanPlanDivisions.filter((p) => p.isActive)[0].title as
                  | "monthly"
                  | "quarterly"
              }
            />
          )}

          {userIsAfrican === false && (
            <NonAfricanPlansContainer
              plans={nonAfricaPlans}
              currentDivision={
                nonAfricanPlanDivisions.filter((p) => p.isActive)[0].title as
                  | "monthly"
                  | "annually"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanContainerV2;
