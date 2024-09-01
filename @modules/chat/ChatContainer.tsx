import React, { FC } from "react";
import NewMessageContainer from "./NewMessageContainer";
import UserMessage from "./UserMessage";
import SystemMessage from "./SystemMessage";

const ChatContainer: FC = () => {
  return (
    <>
      <section className="bg-[#FAFAFA] h-[calc(100vh-230px)] pt-10 px-14 max-md:px-6 pb-8 overflow-y-auto w-full rounded-xl">
        <div className="flex flex-col h-auto min-h-[calc(100vh-305px)] justify-end gap-12">
          <UserMessage message="hey there testing this feature" />
          <SystemMessage
            message={`
                The request to provide information on the mechanism of action, uses, side effects, and contraindications of beta 2 sympathomimetics in asthma patients is within the context of the document. Here is a detailed response addressing all aspects of the request.\n\n## Mechanism of Action\n\n- **How They Work**: \n  - Beta 2 sympathomimetics bind to beta-2 adrenergic receptors on the smooth muscles lining the airways.\n  \n- **Outcome**: \n  - This binding leads to relaxation of the smooth muscles, resulting in bronchodilation (widening of the airways). \n  - It also reduces mucus secretion and improves airflow, making it easier for the patient to breathe.\n\n- **Real-Life Example**: \n  - Think of beta 2 sympathomimetics as a key that unlocks the door to the airway, allowing air to flow in freely, similar to opening a clogged drain to let water flow smoothly.\n\n## Uses\n\n- **Primary Use**: \n  - These medications are primarily used to relieve bronchospasm associated with asthma and chronic obstructive pulmonary disease (COPD).\n\n- **Additional Uses**:\n  - They are also used to manage acute asthma attacks and to provide relief before exercise for patients who experience exercise-induced bronchoconstriction.\n\n- **Real-Life Example**: \n  - Imagine a firefighter using a hose to clear away smoke. Beta 2 sympathomimetics act like the hose that directs airflow to clear breathing passages in an emergency.\n\n## Side Effects\n\n- **Common Side Effects**:\n  - Tremors\n  - Increased heart rate (tachycardia)\n  - Nervousness\n  - Headaches\n  - Palpitations\n\n- **Serious Side Effects**:\n  - Hypokalemia (low potassium levels)\n  - Paradoxical bronchospasm (worsening of asthma symptoms)\n\n- **Real-Life Example**: \n  - The common side effects can feel like having too much caffeine; you may feel shaky or overly energized, which can be uncomfortable.\n\n## Contraindications\n\n- **Pre-existing Conditions**: \n  - Patients with certain conditions, such as severe heart disease or arrhythmias, may need to avoid beta 2 sympathomimetics.\n\n- **Hypersensitivity**: \n  - Patients who are known to be hypersensitive to any ingredient in the medication should not use it.\n\n- **Real-Life Example**: \n  - Just as someone with a nut allergy would avoid nuts, patients with specific conditions must steer clear of beta 2 sympathomimetics to prevent adverse reactions.\n\n## Memorization Tips\n\n- **Mnemonic for Beta 2 Sympathomimetics**: \n  - **M.A.U.S. for their properties**:\n    - **M**echanism of Action: Relax smooth muscles\n    - **A**pplications: Bronchospasm relief\n    - **U**npleasant Effects: Side effects like tremors\n    - **S**afety: Contraindications in heart disease\n\nBy understanding the mechanism, uses, side effects, and contraindications of beta 2 sympathomimetics, patients and caregivers can make informed decisions regarding asthma management and treatment options
                `}
          />
        </div>
      </section>
      <NewMessageContainer />
    </>
  );
};

export default ChatContainer;
