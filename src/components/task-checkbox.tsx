type TaskCheckboxProps = {
    checked: boolean;
};

export function TaskCheckbox({ checked }: TaskCheckboxProps) {
    return (
        <div
            className={`h-4 w-4 rounded border flex items-center justify-center
        ${checked ? "border-black" : "border-muted-foreground"}`}
        >
            {checked && <div className="h-2 w-2 rounded bg-black" />}
        </div>
    );
}
