import { Mail, MessageCircle, type LucideIcon } from "lucide-react";

export type ContactType = "link" | "qrcode";

export interface ContactChannel {
  id: string;
  name: string;
  type: ContactType;
  icon: LucideIcon;
  value?: string; // 用于 link 类型，如 mailto: 或外链
  image?: string; // 用于 qrcode 类型，图片路径
  description?: string; // 可选描述
}

/**
 * 联系方式配置
 * 新增联系方式只需在此添加配置项：
 * - type: "link" 会直接跳转
 * - type: "qrcode" 会在弹窗中显示二维码图片
 */
export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: "email",
    name: "邮箱",
    type: "link",
    icon: Mail,
    value: "mailto:lumina_dev@163.com",
  },
  {
    id: "qq",
    name: "QQ",
    type: "qrcode",
    icon: MessageCircle,
    image: "/images/qrcode-qq.JPG",
    description: "扫描二维码添加 QQ",
  },
  // 示例：添加更多联系方式
  // {
  //   id: "wechat",
  //   name: "微信群",
  //   type: "qrcode",
  //   icon: MessageCircle,
  //   image: "/images/qrcode-wechat.jpg",
  //   description: "扫描二维码加入微信群",
  // },
  // {
  //   id: "xiaohongshu",
  //   name: "小红书",
  //   type: "qrcode",
  //   icon: MessageCircle,
  //   image: "/images/qrcode-xhs.jpg",
  //   description: "关注小红书账号",
  // },
];
