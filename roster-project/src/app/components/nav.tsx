"use client";
import {
  Navbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  Link,
  Button,
} from "@heroui/react";
import { FaHome } from "react-icons/fa";
import { usePathname } from "next/navigation";

export function Nav() {
  const path = usePathname().split("/").slice(1);

  return (
    <div className="mb-4 w-screen">
      <Navbar
        isBordered
        classNames={{
          item: [
            "flex",
            "relative",
            "h-full",
            "items-center",
            "data-[active=true]:after:content-['']",
            "data-[active=true]:after:absolute",
            "data-[active=true]:after:bottom-0",
            "data-[active=true]:after:left-0",
            "data-[active=true]:after:right-0",
            "data-[active=true]:after:h-[2px]",
            "data-[active=true]:after:rounded-[2px]",
            "data-[active=true]:after:bg-primary",
          ],
        }}
        className="max-w-full hidden md:flex"
      >
        <NavbarBrand>
          <Link color="foreground" href="/">
            <Button
              variant={path[0] === "" ? "ghost" : "faded"}
              isIconOnly
              color="default"
              aria-label="home"
            >
              <FaHome />
            </Button>
          </Link>
        </NavbarBrand>

        <NavbarContent className=" hidden sm:flex gap-4" justify="center">
          <NavbarItem
            className="hover:underline hover:text-blue-600 hover:font-bold"
            isActive={path.includes("roster") || path.includes("class")}
          >
            <Link aria-current="page" color="foreground" href="/roster">
              Manage Rosters
            </Link>
          </NavbarItem>

          <NavbarItem
            className="hover:underline hover:text-blue-600 hover:font-bold"
            isActive={path.includes("students")}
          >
            <Link aria-current="page" color="foreground" href="/students">
              Manage Students
            </Link>
          </NavbarItem>

          <NavbarItem
            className="hover:underline hover:text-blue-600 hover:font-bold"
            isActive={path.includes("stats")}
          >
            <Link href="/stats" color="foreground" aria-current="page">
              View Statistics
            </Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </div>
  );
}
