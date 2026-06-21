export const PERSON_DIALOGUE = [
  { player: '你好！', npc: '哦，你好！看起来你是个战士？' },
  { player: '是的，我在执行任务。', npc: '任务？听起来很严肃。' },
  { player: '这里风景不错。', npc: '停下来看看风景也不错。' },
  { player: '我得走了。', npc: '祝你好运！' },
];

export const DANCER_DIALOGUE = [
  { player: '你好！', npc: '嗨，你也来看镜子呀？' },
  { player: '你跳得真好。', npc: '谢谢，我天天在这儿练。' },
  { player: '我也可以跳吗？', npc: '当然，按 J 开始跳舞。' },
];

export function createDialogueSession(lines) {
  let index = 0;

  return {
    current() {
      return lines[Math.min(index, lines.length - 1)];
    },
    next() {
      index = Math.min(index + 1, lines.length);
      return lines[Math.min(index, lines.length - 1)];
    },
    reset() {
      index = 0;
    },
    isComplete() {
      return index >= lines.length - 1;
    },
  };
}
