import { ReactNode } from "react";

type CardProps = {
  title: ReactNode;
  description: string;
  button: ReactNode;
};

export function Card({ title, description, button }: CardProps) {
  return (
    <div className="flex flex-col justify-center items-center bg-white shadow-lg rounded-lg p-6 m-4 w-64 h-64">
      {title}
      <p className="text-xl text-center text-gray-600 mt-2">{description}</p>
      {button}
    </div>
  );
}
