"use client";

import { useEffect, useState } from "react";
import { getIconUrl, type IconSize, type IconStyle } from "@/lib/icon-utils";

interface IconButtonProps {
  icon: string;
  iconSize?: IconSize;
  iconStyle?: IconStyle;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Reusable icon button component using Heroicons SVG
 * Fetches SVG from CDN and renders as inline image
 */
export function IconButton({
  icon,
  iconSize = "24",
  iconStyle = "solid",
  onClick,
  disabled = false,
  title,
  ariaLabel,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
}: IconButtonProps) {
  const [iconUrl, setIconUrl] = useState<string>("");

  useEffect(() => {
    const url = getIconUrl(icon, iconSize, iconStyle);
    setIconUrl(url);
  }, [icon, iconSize, iconStyle]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {iconUrl && (
        <img
          src={iconUrl}
          alt={ariaLabel || title || "icon"}
          style={{
            width: iconSize,
            height: iconSize,
            display: "block",
            pointerEvents: "none",
          }}
        />
      )}
    </button>
  );
}
