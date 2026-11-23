import { FC, useEffect } from "react";
import { EventName, track } from "./track";

/** Records one event when it appears (a limit reached, an upgrade prompt shown). */
const TrackOnce: FC<{ name: EventName; which?: string }> = ({ name, which }) => {
  useEffect(() => {
    track(name, which ? { which } : undefined);
  }, [name, which]);
  return null;
};

export default TrackOnce;
