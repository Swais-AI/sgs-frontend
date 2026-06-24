"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// UPDATED role names as per manager's request
const roles = [
  {
    value: "admin",
    title: "College Admin",
    description: "Manage college, users, content and academic activities.",
    icon: "AD",
  },
  {
    value: "principal",
    title: "Principal / Headmaster",
    description: "Oversee school operations, staff, and academic performance.",
    icon: "PR",
  },
  {
    value: "teacher",
    title: "Faculty / Teacher",
    description: "Create and manage classes, content and assess student learning.",
    icon: "TE",
  },
  {
    value: "student",
    title: "Student",
    description: "Access learning materials, attend classes and track progress.",
    icon: "ST",
  },
  {
    value: "parent",
    title: "Parent",
    description: "Monitor your child's learning progress and activities.",
    icon: "PA",
  },
  {
    value: "guest",
    title: "Guest",
    description: "Explore public content and resources without a full account.",
    icon: "GU",
  },
];

type RoleSelectorProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function RoleSelector({ action }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState(roles[0].value);
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = roles.find((role) => role.value === selectedRole) ?? roles[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const maxHeight = window.innerWidth <= 640 ? 180 : 240;
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        maxHeight,
        overflowY: "auto",
        overflowX: "hidden",
        border: "1px solid #dbe6f7",
        borderRadius: "16px",
        background: "rgba(255, 255, 255, 0.99)",
        boxShadow: "0 20px 44px rgba(27, 59, 118, 0.14)",
      });
    }
  };

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const menu = document.getElementById("role-listbox");
      if (
        !rootRef.current?.contains(event.target as Node) &&
        !menu?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    function handleScroll(event: Event) {
      const menu = document.getElementById("role-listbox");
      if (menu?.contains(event.target as Node)) return;
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      updateMenuPosition();
    }
    setIsOpen((open) => !open);
  };

  return (
    <form action={action} className="role-form">
      <label className="field-label" htmlFor="role-trigger">
        User Type<span>*</span>
      </label>

      <input type="hidden" name="role" value={selected.value} />

      <div className="role-dropdown" ref={rootRef}>
        <button
          id="role-trigger"
          ref={triggerRef}
          type="button"
          className={`role-trigger ${isOpen ? "role-trigger-open" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls="role-listbox"
          onClick={handleToggle}
        >
          <span className="role-trigger-main">
            <span className="role-mini-icon" aria-hidden="true">
              {selected.icon}
            </span>
            <span className="role-trigger-label">{selected.title}</span>
          </span>
          <span className="select-arrow" aria-hidden="true">
            {isOpen ? "^" : "v"}
          </span>
        </button>
      </div>

      {mounted && isOpen &&
        createPortal(
          <div
            id="role-listbox"
            className="role-menu"
            style={menuStyle}
            role="listbox"
            aria-label="User types"
          >
            {roles.map((role) => {
              const active = role.value === selected.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  className={`role-option ${active ? "role-option-active" : ""}`}
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setSelectedRole(role.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="role-mini-icon role-option-icon" aria-hidden="true">
                    {role.icon}
                  </span>
                  <span className="role-option-copy">
                    <strong>{role.title}</strong>
                    <small>{role.description}</small>
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )}

      <button type="submit" className="role-submit-button">
        Continue with Selected User Type {"->"}
      </button>
    </form>
  );
}
