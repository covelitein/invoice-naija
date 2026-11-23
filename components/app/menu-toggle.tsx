type MenuToggleProps = {
  open: boolean;
  onClick: () => void;
  controls: string;
};

export function MenuToggle({ open, onClick, controls }: MenuToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="menu-toggle"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? "Close menu" : "Open menu"}
    >
      <span className="menu-toggle-lines" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}
