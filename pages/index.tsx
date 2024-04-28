import MCQContainer from "@/@modules/home/MCQContainer";
import AppHead from "@/@shared/components/AppHead";

export default function Home() {
  return (
    <>
      <AppHead />
      <div>
        <MCQContainer />
      </div>
    </>
  );
}
