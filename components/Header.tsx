import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/solid";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const Header: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  const { data: session, status } = useSession();

  let left = (
    <div className="left">
      <Link href="/">
        <a className="bold" data-active={isActive("/")}>
          Feed
        </a>
      </Link>
    </div>
  );

  let right = null;

  if (status === "loading") {
    left = (
      <div className="left">
        <Link href="/">
          <a className="bold" data-active={isActive("/")}>
            Feed
          </a>
        </Link>
      </div>
    );
    right = (
      <div className="right">
        <p>Validating session ...</p>
      </div>
    );
  }

  if (!session) {
    right = (
      <div className="right">
        <Link href="/api/auth/signin">
          <a data-active={isActive("/signup")}>Log in</a>
        </Link>
      </div>
    );
  }

  if (session) {
    left = (
      <div className="left">
        <Link href="/">
          <a className="bold" data-active={isActive("/")}>
            Feed
          </a>
        </Link>
        <Link href="/drafts">
          <a data-active={isActive("/drafts")}>My drafts</a>
        </Link>
      </div>
    );
    right = (
      <div className="right">
        <p>
          {session.user.name} ({session.user.email})
        </p>
        <img src={session.user.image} className="rounded-full" />
        <button onClick={() => signOut()}>
          <a>Log out</a>
        </button>
      </div>
    );
  }

  return (
    <nav className="flex items-center sticky top-0 left-0 right-0 bg-plant-green p-2 z-50">
      {session && (
        <>
          <div className="flex-1" />
          <button
            className="text-white rounded-sm mr-2"
            onClick={() => signOut()}
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
          </button>

          <img
            width={45}
            src={session.user.image}
            className="rounded-full bg-white"
          />
        </>
      )}
    </nav>
  );
};

export default Header;