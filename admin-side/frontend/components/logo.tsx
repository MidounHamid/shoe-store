import { useTheme } from "next-themes";
import Image from "next/image";

type LogoSectionProps = {
  width?: number;
  height?: number;
  className?: string;
  ImageClassName?: string;
};

const LogoSection = ({
  width = 200,
  height = 100,
  className = "p-4",
  ImageClassName = "",
}: LogoSectionProps) => {
  const  theme  = useTheme();
    const isDark =theme.theme === "dark" || (theme.theme === "system" && theme.systemTheme === "dark");

  const imageSrc = isDark ? "/azidcar-white.png" : "/azidcar.png";



  return (
    <div className={className}>
      <Image src={imageSrc} alt="Car" width={width} height={height} className={ImageClassName} priority />
    </div>
  );
};

export default LogoSection;
