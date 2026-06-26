import Image from "next/image";

/**
 * Avatar da assistente virtual Alice (retrato circular oficial).
 * Imagem em public/imagens/alice-avatar.png
 */
const ALICE_IMAGE = "/imagens/alice-avatar.png";

export default function AliceAvatar({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-brand-50 ring-2 ring-brand-400/40 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={ALICE_IMAGE}
        alt="Alice — assistente de IA da Siarom"
        width={size}
        height={size}
        className="h-full w-full object-cover object-top"
      />
    </span>
  );
}
