import { type FC } from "react";
import classNames from "classnames";
import { type ButtonProps } from "./Button.types";

export const Button: FC<ButtonProps> = ({ className, ...props }) => (
  <button
    className={classNames(
      "p-2 border-2 border-amber-100 cursor-pointer rounded-2xl hover:opacity-80",
      className
    )}
    {...props}
  />
);
