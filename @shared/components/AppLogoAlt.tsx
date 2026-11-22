import React, { FC } from "react";
import AppMark from "./AppLayout/AppMark";

interface Props {
  size?: "md" | "sm" | "xs";
}

const sizes = { md: 22, sm: 18, xs: 16 };

/** The logo for dark surfaces: white wordmark beside the purple "AI" square. */
const AppLogoAlt: FC<Props> = ({ size = "md" }) => <AppMark tone="white" size={sizes[size]} />;

export default AppLogoAlt;
