import { addToast, Chip, Tooltip } from "@heroui/react";

interface CourseChipProps {
  courseName: string;
  _id: string;
  onUpdate?: () => void;
}

const CloseIcon = ({ size = 20, className = "" }) => (
  <Tooltip placement="top-end" color="danger" content="Remove Student From Class">
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M15 5L5 15M5 5L15 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </Tooltip>
);

export default function CourseChip({
  courseName,
  _id,
  onUpdate,
}: CourseChipProps) {
  const handleRemove = () => {
    fetch(`/api/classes/${courseName}/students`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: _id,
      }),
    });

    if (onUpdate) {
      onUpdate();
    }

    addToast({
      title: "Student Removed!",
      color: "success",
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });
  };
  return (
    <>
      <Chip
        onClose={handleRemove}
        variant="flat"
        className="flex items-center"
        endContent={<CloseIcon />}
      >
        {courseName}
      </Chip>
    </>
  );
}
