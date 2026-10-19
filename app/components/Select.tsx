"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  value: string;
  label: string;
  hint?: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  /** Extra classes for the trigger button. */
  className?: string;
  /** Minimum width of the dropdown panel (the trigger can be narrower). */
  menuMinWidth?: number;
};

const MENU_MAX_HEIGHT = 280;
const MENU_GAP = 8;
const VIEWPORT_MARGIN = 12;
const OPTION_ESTIMATED_HEIGHT = 52;

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Pilih",
  disabled = false,
  ariaLabel,
  className = "",
  menuMinWidth = 220,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const listboxId = useId();

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  // Posisi dropdown dihitung dari trigger lalu dipasang secara fixed lewat portal,
  // sehingga tidak terpotong oleh container yang memakai overflow-hidden.
  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.max(rect.width, menuMinWidth);
    const estimatedHeight = Math.min(
      options.length * OPTION_ESTIMATED_HEIGHT + 12,
      MENU_MAX_HEIGHT,
    );

    const spaceBelow =
      window.innerHeight - rect.bottom - MENU_GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - MENU_GAP - VIEWPORT_MARGIN;
    const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    const maxHeight = Math.max(
      120,
      Math.min(MENU_MAX_HEIGHT, openUpward ? spaceAbove : spaceBelow),
    );

    const top = openUpward
      ? Math.max(VIEWPORT_MARGIN, rect.top - MENU_GAP - maxHeight)
      : rect.bottom + MENU_GAP;

    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, rect.right - width),
      window.innerWidth - width - VIEWPORT_MARGIN,
    );

    setPosition((prev) =>
      prev &&
      Math.abs(prev.top - top) < 0.5 &&
      Math.abs(prev.left - left) < 0.5 &&
      Math.abs(prev.width - width) < 0.5 &&
      Math.abs(prev.maxHeight - maxHeight) < 0.5
        ? prev
        : { top, left, width, maxHeight },
    );
  }, [menuMinWidth, options.length]);

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false);
    setActiveIndex(-1);

    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    if (disabled || options.length === 0) return;

    updatePosition();
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }, [disabled, options.length, selectedIndex, updatePosition]);

  // Tutup saat klik di luar + jaga posisi dropdown saat halaman di-scroll/resize.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      closeMenu();
    }

    function handleViewportChange() {
      updatePosition();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, closeMenu, updatePosition]);

  // Pastikan opsi yang sedang disorot tetap terlihat di dalam panel.
  useEffect(() => {
    if (!open || activeIndex < 0) return;

    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function selectOption(option: SelectOption) {
    if (option.value !== value) onChange(option.value);

    closeMenu(true);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (disabled || options.length === 0) return;

    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openMenu();
      }

      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % options.length);
        break;

      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(
          (index) => (index - 1 + options.length) % options.length,
        );
        break;

      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;

      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;

      case "Enter":
      case " ":
        event.preventDefault();

        if (activeIndex >= 0 && options[activeIndex]) {
          selectOption(options[activeIndex]);
        }

        break;

      case "Escape":
        event.preventDefault();
        closeMenu(true);
        break;

      case "Tab":
        closeMenu();
        break;
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={
          ariaLabel
            ? `${ariaLabel}: ${selected ? selected.label : placeholder}`
            : undefined
        }
        aria-activedescendant={
          open && activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        className={`group flex h-10 w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-3.5 text-sm font-bold text-gray-900 shadow-sm outline-none transition hover:border-gray-300 hover:bg-gray-50 focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <span className="flex min-w-0 items-baseline gap-1.5">
          <span
            className={`truncate ${selected ? "" : "font-medium text-gray-400"}`}
          >
            {selected ? selected.label : placeholder}
          </span>

          {selected?.hint && (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              {selected.hint}
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180 text-gray-600" : ""
          }`}
        />
      </button>

      {open &&
        position &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            onKeyDown={handleKeyDown}
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
            className="select-menu fixed z-[80] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-1.5 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.28)] ring-1 ring-black/5"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <button
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-green-50 font-semibold text-green-800"
                      : "font-medium text-gray-700"
                  } ${isActive && !isSelected ? "bg-gray-100" : ""}`}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{option.label}</span>

                    {option.hint && (
                      <span
                        className={`mt-0.5 text-[11px] font-medium uppercase tracking-wide ${
                          isSelected ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {option.hint}
                      </span>
                    )}
                  </span>

                  {isSelected && (
                    <Check size={16} className="shrink-0 text-green-600" />
                  )}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
