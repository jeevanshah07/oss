import { Key, useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  MenuTriggerAction,
} from "@heroui/react";
import { useFilter } from "@react-aria/i18n";
import { majors } from "./lib/data";

interface majorSelectProps {
  onUpdate?: (item: string) => void;
}

type FieldState = {
  selectedKey: Key | null;
  inputValue: string;
  items: typeof majors;
};

export default function MajorSelect({ onUpdate }: majorSelectProps) {
  const [fieldState, setFieldState] = useState<FieldState>({
    selectedKey: "",
    inputValue: "",
    items: majors,
  });

  const { startsWith } = useFilter({ sensitivity: "base" });

  const onSelectionChange = (key: Key | null) => {
    setFieldState((prevState) => {
      let selectedItem = prevState.items.find((option) => option.key === key);
      return {
        inputValue: selectedItem?.label || "",
        selectedKey: key,
        items: majors.filter((item) =>
          startsWith(item.label, selectedItem?.label || ""),
        ),
      };
    });

    if (onUpdate) {
      const selectedItem = fieldState.items.find(
        (option) => option.key === key,
      );
      onUpdate(selectedItem?.label || "");
    }
  };

  const onInputChange = (value: string) => {
    setFieldState((prevState) => ({
      inputValue: value,
      selectedKey: value === "" ? null : prevState.selectedKey,
      items: majors.filter((item) => startsWith(item.label, value)),
    }));
  };

  const onOpenChange = (isOpen: boolean, menuTrigger: MenuTriggerAction) => {
    if (menuTrigger === "manual" && isOpen) {
      setFieldState((prevState) => ({
        inputValue: prevState.inputValue,
        selectedKey: prevState.selectedKey,
        items: majors,
      }));
    }
  };

  return (
    <Autocomplete
      className="max-w-md"
      inputValue={fieldState.inputValue}
      items={fieldState.items}
      label="Major"
      placeholder="Search for a major"
      selectedKey={fieldState.selectedKey}
      variant="bordered"
      onInputChange={onInputChange}
      onOpenChange={onOpenChange}
      onSelectionChange={onSelectionChange}
    >
      {(item) => (
        <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
      )}
    </Autocomplete>
  );
}
