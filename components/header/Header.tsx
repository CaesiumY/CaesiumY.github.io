import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header>
      <div className="mx-auto flex max-w-7xl items-center justify-between p-8">
        <div>
          <Link href={"/"} className="btn btn-square btn-ghost">
            <h1 className="text-2xl">🛹</h1>
          </Link>
        </div>
        <div>
          <nav>
            <ul className="flex flex-row gap-2">
              <li>
                <Link href={"/blog"} className="btn btn-ghost text-lg">
                  Blog
                </Link>
              </li>
              <li>
                <Link href={"/series"} className="btn btn-ghost text-lg">
                  Series
                </Link>
              </li>
              <li>
                <Link href={"/about"} className="btn btn-ghost text-lg">
                  About
                </Link>
              </li>
              <li>
                <button className="btn flex flex-row gap-2">
                  <p className="font-medium">Search</p>
                  <kbd className="kbd bg-white">⌘ K</kbd>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
