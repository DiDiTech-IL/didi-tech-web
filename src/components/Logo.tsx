import { Link } from "react-router-dom";
import svgLogo from "../assets/didi_tech_logo.svg";

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center justify-start gap-2 overflow-hidden">
      <div className="flex-shrink-0 animate-spinIn">
        <img
          src={svgLogo}
          alt="DiDi Tech Logo"
          className="h-16 w-16 fill-white"
        />
      </div>
      <div className="overflow-hidden animate-slideInRight opacity-0">
        <span className="font-code font-bold hidden sm:inline ">
          פיתוח והדרכה | DiDi Tech
        </span>
      </div>
    </Link>
  );
};