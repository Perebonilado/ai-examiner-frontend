import Button from "@/@shared/ui/Button";
import HintIcon from "@/icons/HintIcon";
import React, { FC, useState } from "react";
import s from "./styles.module.css";
import { useModalContext } from "@/contexts/ModalContext";
import HintCard from "../HintCard";

interface Props {
  question: string;
  answer: string;
  hint?: string;
}

const FlashCardItem: FC<Props> = ({ question, answer, hint }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const { setModalContent } = useModalContext();

  return (
    <div
      className={`${s["perspective-1000"]} w-full max-w-[700px] bg-transparent`}
    >
      <div
        className={`relative w-full min-h-[300px] transition-transform duration-500 bg-transparent ${
          s["transform-style-preserve-3d"]
        } ${isFlipped ? s["rotate-y-180"] : ""}`}
      >
        <div
          className={`border bg-transparent shadow-md border-gray-200 rounded-lg absolute p-4 ${s["backface-hidden"]} w-full h-full flex flex-col`}
        >
          {hint && <div
            className="flex items-center gap-2 w-fit cursor-pointer"
            style={{ flex: 1 }}
          >
            <Button
              onClick={() => {
                setModalContent(<HintCard hint={hint}/>);
              }}
              variant="text"
              title="Hint"
              starticon={<HintIcon />}
            />
          </div>}
          <div
            className="flex flex-col gap-8 items-center justify-center p-2"
            style={{ flex: 8 }}
          >
            <p className="text-lg text-center leading-relaxed max-h-[140px] overflow-y-auto">{question} Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem ipsa ad nemo, at error quibusdam enim dolore, nobis esse laboriosam officiis harum tempore accusantium fuga consequatur veritatis provident labore nesciunt ullam quisquam ab dolorem sequi? In asperiores veniam deleniti explicabo provident dolorum eos alias ut tempora odio rem ex, at aut repellendus non illo voluptatum, vero fuga incidunt ab laudantium laborum. Dignissimos fuga nam distinctio laudantium a ab, velit nisi accusamus officia esse temporibus, id sapiente repudiandae vero itaque! Dicta accusantium magni veniam, tempora excepturi modi ducimus odio. Reprehenderit, veniam. Ipsum sequi fuga veniam obcaecati voluptatem odio alias praesentium illo? Laborum ab dignissimos corrupti voluptatem! Vero at, quas iste deserunt facilis temporibus tempora adipisci voluptatum expedita in voluptates illum repellendus earum dolores beatae, quisquam ducimus molestiae est assumenda? Reprehenderit deserunt expedita labore natus. Voluptatem, sunt ipsum error eveniet, harum, pariatur a possimus reiciendis eaque iste sit explicabo commodi architecto excepturi impedit ea inventore nemo autem quae ex accusantium! Sint neque ratione fuga laboriosam. Sapiente facere temporibus placeat exercitationem ad culpa tempore magni animi distinctio natus quia, aliquam cupiditate reprehenderit, earum hic, maxime dolorem nam commodi optio deserunt eum saepe molestias assumenda! Officiis pariatur quia similique fuga, dicta magnam? Praesentium ad sapiente officia saepe voluptatem, adipisci libero corrupti labore, laborum iusto quod. Officiis asperiores laboriosam explicabo assumenda mollitia. Voluptatibus vel id quas labore fuga corrupti dolorem mollitia, cum placeat fugiat optio molestias eius maxime commodi atque, natus nesciunt. Perspiciatis, asperiores saepe ratione distinctio inventore porro hic quam architecto, culpa nihil sit vero ex possimus blanditiis molestias soluta, et voluptatum minus exercitationem laboriosam aut atque quis quia? Laboriosam tenetur cum hic, accusamus explicabo ea laborum quos fuga voluptates provident fugit vitae eligendi, ipsam eius corporis sit mollitia inventore dolorum sapiente. Incidunt laborum officiis ab at et est deleniti rerum ex quia dolore?</p>
            <Button
              title="Show Answer"
              variant="outlined"
              size="large"
              onClick={handleFlip}
            />
          </div>
        </div>
        <div
          className={`bg-transparent border shadow-md border-gray-200 flex gap-8 flex-col items-center justify-center rounded-lg absolute ${s["backface-hidden"]} w-full h-full transform ${s["rotate-y-180"]}`}
        >
          <p className="text-lg text-center leading-relaxed max-h-[140px] overflow-y-auto">{answer}</p>
          <div onClick={handleFlip}>
            <Button title="Hide Answer" variant="outlined" size="large" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCardItem;
