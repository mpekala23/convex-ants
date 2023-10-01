import { Dispatch } from "react";

interface Props {
  value: string;
  setValue: Dispatch<string>;
  className?: string;
}

export default function OddInput({ value, setValue, className }: Props) {
  return (
    <input
      className={
        "bg-slate-50 bg-opacity-10 p-1 border border-slate-50 " + className ||
        ""
      }
      type="text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
    />
  );
}

interface GuessProps {
  value: number;
  setValue: Dispatch<number>;
  className?: string;
}

export function OddGuess({ value, setValue, className }: GuessProps) {
  return (
    <input
      className={
        "bg-slate-50 bg-opacity-10 p-1 border border-slate-50 " + className ||
        ""
      }
      type="number"
      value={value}
      onChange={(e) => {
        setValue(parseFloat(e.target.value));
      }}
    />
  );
}
