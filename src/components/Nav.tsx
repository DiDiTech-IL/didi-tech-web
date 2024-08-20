import { toast } from "sonner";
import { Logo } from "./Logo";

function Nav() {
  return (
    <header className="fixed top-0 w-full h-18 bg-white dark:bg-gray-800 z-50 shadow-md font-sans px-4 lg:px-6">
      <div className="flex items-center justify-between w-full h-full">
        <Logo />
        <nav className="flex gap-4 sm:gap-6">
          <a href="#services" className="text-sm font-medium hover:underline underline-offset-4" onClick={()=>toast.info("really?")}>
            Services
          </a>
          <a href="#team" className="text-sm font-medium hover:underline underline-offset-4"  onClick={()=>toast.info("I'm being serious?")}>
            Team
          </a>
          <a href="#about" className="text-sm font-medium hover:underline underline-offset-4" onClick={()=>toast.info("This page is under construction! leave me alone!")}>
            About
          </a>
          <a href="#contact" className="text-sm font-medium hover:underline underline-offset-4" onClick={()=>toast.info("I'll find you...")}>
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Nav;
