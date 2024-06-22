import Jumbotron from "@/@modules/home/Jumbotron";
import AppHead from "@/@shared/components/AppHead";
import Navbar from "@/@shared/components/Navbar";
import descriptionData from "../json-data/description.json"
import DescriptionItemContainer from "@/@modules/home/DescriptionItemContainer";

export default function Home() {
  return (
    <>
      <AppHead />
      <Navbar />
      <Jumbotron />
      <DescriptionItemContainer data={descriptionData}/>
    </>
  );
}
