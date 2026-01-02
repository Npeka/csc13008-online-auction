import { useState } from "react";
import { Menu } from "lucide-react";
import { HeaderActions } from "./header-actions";
import { Logo } from "./logo";
import { MegaMenu } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";
import { SearchBar } from "./search-bar";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-1000 border-b border-border bg-bg-card/95 backdrop-blur-md">
        <div className="container-app">
          {/* Top bar */}
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-bg-secondary lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Logo />
            <SearchBar />
            <HeaderActions />
          </div>

          {/* Category Navigation - Desktop */}
          <div className="hidden border-t border-border py-2 lg:block">
            <MegaMenu />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 md:hidden">
          <SearchBar variant="mobile" className="mx-0 block" />
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
