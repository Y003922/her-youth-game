/**
 * 姓名模板工具：统一处理剧情文本中的 {name} 占位符
 * 未设置姓名时回退为第二人称“你”，保证所有文本都能正常渲染
 */
export const NAME_PLACEHOLDER = '{name}'

export function applyName(template: string | undefined | null, playerName?: string): string {
  if (!template) return ''
  const displayName = playerName && playerName.trim() ? playerName.trim() : '你'
  return template.split(NAME_PLACEHOLDER).join(displayName)
}
