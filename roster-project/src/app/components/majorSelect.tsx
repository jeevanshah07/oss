import { Key, useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  MenuTriggerAction,
} from "@heroui/react";
import { useFilter } from "@react-aria/i18n";
import { majors } from "./lib/data";

import type { major } from "./lib/data";

interface majorSelectProps {
  onUpdate?: (item: string) => void;
  type: "major" | "minor";
  value: string;
}

type FieldState = {
  selectedKey: Key | null;
  inputValue: string;
  items: typeof majors;
};

export default function MajorSelect({
  value,
  type,
  onUpdate,
}: majorSelectProps) {
  const defaultValue: major | undefined = majors.find(
    (option) => option.label === value,
  );

  const [fieldState, setFieldState] = useState<FieldState>({
    selectedKey: defaultValue ? defaultValue.key : "",
    inputValue: defaultValue ? defaultValue.label : "",
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
      label={type === "major" ? "Major" : "Minor"}
      placeholder={`Search for a ${type === "major" ? "major" : "minor"}`}
      selectedKey={fieldState.selectedKey}
      variant="bordered"
      onInputChange={onInputChange}
      onOpenChange={onOpenChange}
      onSelectionChange={onSelectionChange}
      isRequired={type === "major"}
    >
      {(item) => (
        <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
      )}
    </Autocomplete>
  );
}
