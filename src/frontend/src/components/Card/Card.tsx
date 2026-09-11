import { ReactNode } from "react";

type CardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  button: ReactNode;
};

export function Card({ icon, title, description, button }: CardProps) {
  return (
    <div className="group flex flex-col items-center text-center bg-white rounded-2xl p-8 w-full max-w-xs border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-transparent">
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gray-900 text-white mb-5 transition-colors duration-300 group-hover:bg-indigo-600">
        {icon}
      </div>
      <div className="text-xl font-semibold text-gray-900">{title}</div>
      <p className="text-base text-gray-500 mt-2 leading-relaxed">
        {description}
      </p>
      <div className="mt-6">{button}</div>
    </div>
  );
}
