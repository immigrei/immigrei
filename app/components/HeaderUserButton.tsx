"use client";

import { UserButton } from "@clerk/nextjs";

export default function HeaderUserButton() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Perfil"
          href="/perfil"
          labelIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <UserButton.Link
          label="Editar informações de imigração"
          href="/onboarding/edit"
          labelIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 20H21M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
