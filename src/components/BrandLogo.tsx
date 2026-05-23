import Image from "next/image";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg" | "login";
  className?: string;
};

const sizes = {
  sm: { width: 100, height: 100, className: "h-14 w-auto" },
  md: { width: 170, height: 170, className: "h-28 w-auto" },
  login: { width: 240, height: 240, className: "h-36 md:h-44 w-auto" },
  lg: { width: 280, height: 280, className: "h-40 md:h-52 w-auto" },
} as const;

export default function BrandLogo({
  size = "md",
  className = "",
}: BrandLogoProps) {
  const { width, height, className: sizeClass } = sizes[size];

  return (
    <Image
      src="/images/neastreaming.png"
      alt="Nea Streaming"
      width={width}
      height={height}
      priority={size !== "sm"}
      className={`mx-auto object-contain drop-shadow-[0_0_12px_#00FF0044] ${sizeClass} ${className}`.trim()}
    />
  );
}
