import Giscus from "@giscus/react";
import { GISCUS } from "@/config";
import { useTheme } from "@/hooks/useTheme";

export default function Comments() {
  const theme = useTheme();

  return (
    <div className="mt-8">
      <Giscus {...GISCUS} theme={theme} />
    </div>
  );
}
