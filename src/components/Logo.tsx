import svgLogo from "../assets/didi_tech_logo.svg";

export const Logo = () => {
  return (
    <a href="/" className="flex items-center justify-center">
      <img
        src={svgLogo}
        alt="DiDi Tech Logo"
        className="h-16 w-16 animate-spinIn"
      />
      <span className="font-code font-bold px-2 hidden sm:inline animate-slideIn opacity-0">
        DiDi Tech
      </span>
    </a>
  );
};
