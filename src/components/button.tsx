import { ReactNode } from "react";

interface Props {
  children?: ReactNode | ReactNode[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (() => any) | (() => Promise<any>);
  className?: string;
  disabled?: boolean;
  disabledText?: string;
}

export default function OddButton({
  className,
  children,
  onClick,
  disabled,
  disabledText,
}: Props) {
  return (
    <>
      <p
        className={
          "border border-slate-100 text-center " +
          (className || "") +
          " " +
          (disabled ? "opacity-50" : "clickable")
        }
        onClick={disabled ? undefined : onClick}
      >
        {children}
      </p>
      {disabled && disabledText && (
        <p className="mt-1 italic text-sm opacity-50 text-center">
          {disabledText}
        </p>
      )}
    </>
  );
}
