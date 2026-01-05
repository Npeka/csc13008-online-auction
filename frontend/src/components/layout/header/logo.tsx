import { Link } from "react-router";
import logoImage from "@/assets/logo.avif";

export function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <div className="size-10">
        <img src={logoImage} alt="logo" />
      </div>
      <span className="hidden text-xl font-bold text-text sm:block">
        Morphee
      </span>
    </Link>
  );
}
