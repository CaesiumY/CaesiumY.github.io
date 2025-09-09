
interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: string;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/caesiumy",
    linkTitle: "Caesiumy의 GitHub 프로필 보기",
    icon: "ph:github-logo",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/chang-sik-yoon-120757217",
    linkTitle: "Caesiumy의 LinkedIn 프로필 보기",
    icon: "ph:linkedin-logo",
  },
  {
    name: "Mail",
    href: "mailto:dbs2636@gmail.com",
    linkTitle: "Caesiumy에게 이메일 보내기",
    icon: "ph:envelope",
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `Share this post via WhatsApp`,
    icon: "ph:whatsapp-logo",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Share this post on Facebook`,
    icon: "ph:facebook-logo",
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
    icon: "ph:x-logo",
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `Share this post via Telegram`,
    icon: "ph:telegram-logo",
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/pin/create/button/?url=",
    linkTitle: `Share this post on Pinterest`,
    icon: "ph:pinterest-logo",
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: "ph:envelope",
  },
] as const;
