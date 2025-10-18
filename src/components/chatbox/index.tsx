import { MessageSquare } from "lucide-react";
import "../../components/styles/homepage.css"

interface ChatboxProps {
  isMenuOpen?: boolean;
}

export default function Chatbox({ isMenuOpen = false }: ChatboxProps) {
  return (
    <button
    className={`
      fixed 
      right-4 
      bottom-4 
      md:right-6 
      md:bottom-6 
      bg-golden
      hover:bg-transparent 
      text-black
      group
      border
      border-golden
      w-12 
      h-12 
      md:w-16 
      md:h-16 
      rounded-none
      flex 
      items-center 
      justify-center 
      shadow-lg 
      transition-all 
      duration-300
      ${isMenuOpen ? "content-blur" : ""}
    `}
  >
    <MessageSquare 
      className="
        w-6 h-6 
        md:w-7 md:h-7 
        group-hover:text-golden 
        transition-colors 
        duration-300
      "
    />
  </button>
  
  );
}