import Jumbotron from "@/@modules/home/Jumbotron";
import AppHead from "@/@shared/components/AppHead";
import Navbar from "@/@shared/components/Navbar";
import descriptionData from "../json-data/description.json";
import DescriptionItemContainer from "@/@modules/home/DescriptionItemContainer";
import TestKnowledge from "@/@modules/home/TestKnowledge";
import FAQContainer from "@/@modules/home/FAQContainer";
import Footer from "@/@shared/components/Footer";

export default function Home() {
  return (
    <>
      <AppHead />
      <Navbar />
      <Jumbotron />
      <DescriptionItemContainer data={descriptionData} />
      <TestKnowledge />
      <FAQContainer />
      <Footer />
    </>
  );
}
