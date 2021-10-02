import type { Args } from "@sapphire/framework";

export default function getArgs(args: Args) {
  const argArr = args.message.cleanContent.split(" ").slice(2);
  return argArr;
}
