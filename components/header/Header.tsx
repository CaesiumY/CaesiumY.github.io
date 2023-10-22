import Link from "next/link";
import { CommandMenu } from "./command-menu";

const NavLinks = [
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "About",
    href: "/about",
  },
];

const Header = () => {
  return (
    <header className="backdrop-blur-md">
      <div className="navbar mx-auto max-w-7xl p-4">
        <div className="navbar-start">
          <Link href={"/"} className="btn btn-square btn-ghost">
            <h1 className="text-2xl">🔮</h1>
          </Link>
        </div>

        <div className="navbar-end">
          <nav className="flex flex-row items-center gap-2">
            <ul className="hidden flex-row gap-2 sm:flex">
              {NavLinks.map(({ href, title }) => (
                <li key={href}>
                  <Link href={href} className="btn btn-ghost font-medium">
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
            <CommandMenu />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
