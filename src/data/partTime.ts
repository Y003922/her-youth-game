import type { CharacterState } from '@/types'

export interface JobStepOption {
  id: string
  text: string
  score: number
  reply: string
  effects?: Partial<CharacterState>
}

export interface JobStep {
  prompt: string
  options: JobStepOption[]
}

export interface PartTimeJob {
  id: string
  name: string
  icon: string
  hourlyPay: number
  hours: number
  staminaCost: number
  requirement?: { key: keyof CharacterState; value: number; label: string }
  description: string
  rewardKey: keyof CharacterState
  rewardLabel: string
  steps: JobStep[]
}

export const partTimeJobs: PartTimeJob[] = [
  {
    id: 'library_assistant',
    name: '图书馆助理',
    icon: '📚',
    hourlyPay: 25,
    hours: 2,
    staminaCost: 15,
    requirement: { key: 'knowledge', value: 40, label: '学识≥40' },
    description: '整理书架、登记借阅、引导同学找书。环境安静，还能顺便看书。',
    rewardKey: 'knowledge',
    rewardLabel: '学识',
    steps: [
      {
        prompt: '馆员老师交给你一车还回来的书，需要按索书号归位。你会怎么做？',
        options: [
          { id: 'la_s1_a', text: '先分区排序，再逐架归位', score: 2, reply: '老师点头："有条理，这样不容易出错。"', effects: { knowledge: 2 } },
          { id: 'la_s1_b', text: '拿一本放一本，走到哪算哪', score: 0, reply: '跑了十几趟冤枉路，你累得气喘吁吁。', effects: { stamina: -3 } },
          { id: 'la_s1_c', text: '问问老师有没有手推车可以用', score: 1, reply: '老师笑着把推车钥匙给了你："会借力，不错。"', effects: { social: 1 } },
        ],
      },
      {
        prompt: '一位同学着急地问你一本参考书在哪个书架，但系统显示"在馆"却找不到。',
        options: [
          { id: 'la_s2_a', text: '带同学到附近书架一起仔细翻找', score: 2, reply: '书被错放在相邻架子上，你们顺利找到了。', effects: { social: 2 } },
          { id: 'la_s2_b', text: '让同学自己再转转，说不定就在附近', score: 0, reply: '同学失望地走了，你心里有点过意不去。', effects: { mood: -2 } },
          { id: 'la_s2_c', text: '登记信息，找到后第一时间通知他', score: 1, reply: '同学连声道谢，留下了联系方式。', effects: { social: 1 } },
        ],
      },
      {
        prompt: '闭馆前，你发现桌上有一台遗落的平板电脑。',
        options: [
          { id: 'la_s3_a', text: '立刻交到服务台登记失物', score: 2, reply: '失主赶回时连连道谢，馆员老师对你刮目相看。', effects: { mood: 3, social: 1 } },
          { id: 'la_s3_b', text: '先收好，等明天再说', score: 0, reply: '老师提醒：失物必须当天登记，你赶紧补了流程。', effects: { mood: -1 } },
        ],
      },
    ],
  },
  {
    id: 'canteen_helper',
    name: '食堂帮工',
    icon: '🍜',
    hourlyPay: 20,
    hours: 2,
    staminaCost: 25,
    description: '饭点高峰帮忙打饭、收拾餐桌、清洁托盘。节奏快，但管一顿工作餐。',
    rewardKey: 'social',
    rewardLabel: '社交',
    steps: [
      {
        prompt: '饭点高峰，窗口前排起了长队，阿姨让你负责递餐。',
        options: [
          { id: 'ch_s1_a', text: '提前核对菜单，喊号清晰又响亮', score: 2, reply: '队伍流动快了起来，阿姨夸你机灵。', effects: { social: 2 } },
          { id: 'ch_s1_b', text: '低头默默递餐，不敢说话', score: 0, reply: '有同学没听清重复询问，窗口堵了一小会儿。', effects: { mood: -1 } },
        ],
      },
      {
        prompt: '一位同学抱怨菜量太少，当着后面的人群嘟囔起来。',
        options: [
          { id: 'ch_s2_a', text: '笑着解释标准分量，并请阿姨补一勺', score: 2, reply: '同学满意地走了，后面的人也没再起哄。', effects: { social: 2, mood: 1 } },
          { id: 'ch_s2_b', text: '装作没听见，继续忙手里的活', score: 0, reply: '抱怨声越来越大，阿姨只好亲自过来解释。', effects: { mood: -3 } },
          { id: 'ch_s2_c', text: '直接回怼："大家都是这个量"', score: -1, reply: '场面一度尴尬，阿姨赶紧把你换下了窗口。', effects: { social: -2, mood: -2 } },
        ],
      },
      {
        prompt: '收餐盘时，你看到一个托盘下压着一个学生证。',
        options: [
          { id: 'ch_s3_a', text: '交给广播台寻找失主', score: 2, reply: '失主很快跑来领取，一个劲地谢谢你。', effects: { mood: 3 } },
          { id: 'ch_s3_b', text: '放在失物筐里不管了', score: 0, reply: '负责人提醒你要登记，你又多跑了一趟。', effects: { stamina: -2 } },
        ],
      },
    ],
  },
  {
    id: 'tutor',
    name: '家教辅导',
    icon: '✏️',
    hourlyPay: 50,
    hours: 2,
    staminaCost: 15,
    requirement: { key: 'knowledge', value: 55, label: '学识≥55' },
    description: '给高中生辅导语文和文综。时薪高，需要扎实的知识和清晰的表达。',
    rewardKey: 'knowledge',
    rewardLabel: '学识',
    steps: [
      {
        prompt: '第一次上门，学生家长问你打算怎么提高孩子的语文成绩。',
        options: [
          { id: 'tu_s1_a', text: '拿出提前做好的薄弱点分析和辅导计划', score: 2, reply: '家长眼前一亮："果然是有备而来。"', effects: { knowledge: 2, social: 1 } },
          { id: 'tu_s1_b', text: '说先上几节课看看情况再说', score: 0, reply: '家长略显犹豫，勉强同意先试课。', effects: { mood: -1 } },
        ],
      },
      {
        prompt: '讲到现代文阅读，学生一脸茫然，说"完全看不懂作者想表达什么"。',
        options: [
          { id: 'tu_s2_a', text: '用他喜欢的游戏剧情类比，讲"伏笔"和"情感线"', score: 2, reply: '学生恍然大悟，第一次主动做了笔记。', effects: { knowledge: 2, mood: 2 } },
          { id: 'tu_s2_b', text: '让他背标准答案模板，考试直接套', score: 0, reply: '学生越背越困，你也觉得这办法不对劲。', effects: { stamina: -2 } },
          { id: 'tu_s2_c', text: '放慢节奏，一段一段带着他读', score: 1, reply: '进度慢了些，但他终于跟上了思路。', effects: { knowledge: 1 } },
        ],
      },
      {
        prompt: '下课前，家长问孩子最近的表现。',
        options: [
          { id: 'tu_s3_a', text: '如实反馈进步点和待改进处，并给出下周安排', score: 2, reply: '家长当场预付了下个月的课时费。', effects: { mood: 3, social: 2 } },
          { id: 'tu_s3_b', text: '只挑好听的说，哄家长开心', score: -1, reply: '家长转头问了孩子，发现对不上，表情有点微妙。', effects: { social: -2 } },
        ],
      },
    ],
  },
]
