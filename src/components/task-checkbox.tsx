type TaskCheckboxProps = {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (next: boolean) => void;
};

export function TaskCheckbox({
  checked,
  disabled = false,
  onCheckedChange
}: TaskCheckboxProps) {
  const isInteractive = Boolean(onCheckedChange) && !disabled;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={!isInteractive}
      onClick={(e) => {
        // Consumers often place this inside a <Link> row; prevent accidental navigation.
        e.preventDefault();
        e.stopPropagation();
        onCheckedChange?.(!checked);
      }}
      className={`h-4 w-4 rounded border flex items-center justify-center shrink-0
        ${checked ? "border-black" : "border-muted-foreground"}
        ${isInteractive ? "cursor-pointer" : "cursor-default"}`}
      title={checked ? "Mark as not done" : "Mark as done"}
    >
      {checked && <div className="h-2 w-2 rounded bg-black" />}
    </button>
  );
}
