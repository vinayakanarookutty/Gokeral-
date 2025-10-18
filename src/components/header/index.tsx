import { useEffect } from "react";
import Logo from "../../../public/gokeral.png";
import { Menu } from "lucide-react";

const NavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <a
    href={href}
    onClick={onClick}
    className="uppercase text-zinc-100 flex items-center gap-2 px-4 py-2 transition-colors duration-600"
    style={{ fontFamily: "Montserrat, sans-serif" }}
  >
    {children}
  </a>
);

export default function Header({
  isMenuOpen,
  onMenuStateChange,
}: {
  isMenuOpen: boolean;
  onMenuStateChange: (state: boolean) => void;
}) {
  const toggleMenu = () => {
    onMenuStateChange(!isMenuOpen); // Toggle menu state
  };

  const closeMenu = () => {
    onMenuStateChange(false); // Close menu
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed w-full z-20 backdrop-blur-sm border-b border-zinc-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo section */}
          <div className="flex items-center space-x-2">
            <img src={Logo} alt="Go Keral Logo" className="h-24 md:h-24" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/driverRegistration">Driver</NavLink>
            <NavLink href="/register">User</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            <NavLink href="/about">About</NavLink>

          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-golden hover:text-white transition-colors duration-300 z-50"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation - Full screen overlay */}
      <div
        className={`
          fixed 
          inset-0 
          bg-black/95
          backdrop-blur-xl
          z-40 
          md:hidden
          transition-all
          duration-300 
          ease-in-out
          flex
          flex-col
          ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      >
        <div className="flex flex-col h-full pt-24 px-6">
          <div className="flex flex-col space-y-8">
            <NavLink href="/" onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink href="/services" onClick={closeMenu}>
              Services
            </NavLink>
            <NavLink href="/about" onClick={closeMenu}>
              About
            </NavLink>
            <NavLink href="/contact" onClick={closeMenu}>
              Contact
            </NavLink>
            
          </div>

          {/* Additional mobile menu content */}
          {/* <div className="mt-auto mb-12">
            <div
              className="text-zinc-400 space-y-4"
              style={{ fontFamily: "Montserrat" }}
            >
              <p className="text-sm uppercase tracking-wider text-golden">
                Contact Us
              </p>
              <p className="text-sm">contact@gokeral.com</p>
              <p className="text-sm">+91 123 456 7890</p>
            </div>
          </div> */}
        </div>
      </div>
    </header>
  );
}