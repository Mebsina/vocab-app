import { Link } from "react-router-dom";
import { FaHouse } from "react-icons/fa6";
import { FaGamepad } from "react-icons/fa6";

const navIcons = {
  home: <FaHouse />,
  game: <FaGamepad />,
};

const navLinks = {
  default: [{ to: "/", text: navIcons.home }],
  continuePage: [{ to: "/continue", text: navIcons.game }],
};

function Navbar({ linkSet = "default" }) {
  const links = navLinks[linkSet] || navLinks.default;

  return (
    <nav>
      {links.map((link) => (
        <Link key={link.to} to={link.to}>
          {link.text}
        </Link>
      ))}
    </nav>
  );
}

export default Navbar;
