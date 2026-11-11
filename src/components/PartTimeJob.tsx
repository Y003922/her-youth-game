import { useMemo, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { partTimeJobs, type PartTimeJob, type JobStepOption } from '@/data/partTime'
import { applyName } from '@/utils/name'
import type { CharacterState } from '@/types'

type Stage = 'select' | 'briefing' | 'working' | 'result'

interface Settlement {
  job: PartTimeJob
  basePay: number
  multiplier: number
  bonus: number
  totalPay: number
  stars: number
  accumulatedEffects: Partial<CharacterState>
  replies: string[]
}

export function PartTimeJob({ onClose }: { onClose: () => void }) {
  const character = useGameStore((state) => state.character)
  const updateCharacter = useGameStore((state) => state.updateCharacter)
  const playerName = useGameStore((state) => state.playerName)

  const [stage, setStage] = useState<Stage>('select')
  const [job, setJob] = useState<PartTimeJob | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [replies, setReplies] = useState<string[]>([])
  const [stepEffects, setStepEffects] = useState<Partial<CharacterState>>({})
  const [lastReply, setLastReply] = useState('')
  const [settlement, setSettlement] = useState<Settlement | null>(null)

  const meetsRequirement = (j: PartTimeJob) =>
    !j.requirement || (character[j.requirement.key] || 0) >= j.requirement.value

  const startJob = (j: PartTimeJob) => {
    setJob(j)
    setStage('briefing')
  }

  const beginWorking = () => {
    setStepIndex(0)
    setScore(0)
    setReplies([])
    setStepEffects({})
    setLastReply('')
    setStage('working')
  }

  const chooseOption = (option: JobStepOption) => {
    const newScore = score + option.score
    const newReplies = [...replies, option.reply]
    const effects: Partial<CharacterState> = { ...stepEffects }
    if (option.effects) {
      Object.entries(option.effects).forEach(([k, v]) => {
        const key = k as keyof CharacterState
        effects[key] = (effects[key] || 0) + (v || 0)
      })
    }
    setScore(newScore)
    setReplies(newReplies)
    setStepEffects(effects)
    setLastReply(option.reply)

    if (!job) return
    if (stepIndex + 1 < job.steps.length) {
      setTimeout(() => {
        setStepIndex((i) => i + 1)
        setLastReply('')
      }, 1100)
    } else {
      // 结算：评分系数 + 随机好评红包
      const multiplier = newScore >= 4 ? 1.2 : newScore >= 2 ? 1.0 : newScore >= 0 ? 0.8 : 0.6
      const stars = newScore >= 4 ? 3 : newScore >= 2 ? 2 : 1
      const basePay = job.hourlyPay * job.hours
      const bonus = Math.random() < 0.25 ? 15 : 0
      const totalPay = Math.round(basePay * multiplier) + bonus
      const finalEffects: Partial<CharacterState> = {
        ...effects,
        stamina: (effects.stamina || 0) - job.staminaCost,
        [job.rewardKey]: (effects[job.rewardKey] || 0) + 3,
        money: totalPay,
      }
      const result: Settlement = {
        job,
        basePay,
        multiplier,
        bonus,
        totalPay,
        stars,
        accumulatedEffects: finalEffects,
        replies: newReplies,
      }
      updateCharacter(finalEffects)
      setSettlement(result)
      setStage('result')
    }
  }

  const effectLabels: Record<string, string> = {
    knowledge: '学识',
    mood: '心情',
    stamina: '体力',
    literarySkill: '文学',
    aiSkill: 'AI',
    social: '社交',
    love: '恋爱',
    money: '存款',
  }

  const greeting = useMemo(() => applyName('{name}，欢迎来到学生兼职中心！', playerName), [playerName])

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-b from-indigo-50 to-purple-50 p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-800">💼 学生兼职中心</h2>
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-lg shadow text-sm transition-colors"
          >
            ← 返回校园地图
          </button>
        </div>

        {stage === 'select' && (
          <>
            <p className="text-gray-600 mb-4">{greeting} 选择一份兼职，完成真实的工作任务即可领取报酬。工作会消耗体力，注意劳逸结合。</p>
            <div className="grid gap-4 md:grid-cols-3">
              {partTimeJobs.map((j) => {
                const ok = meetsRequirement(j)
                const enoughStamina = character.stamina >= j.staminaCost
                const disabled = !ok || !enoughStamina
                return (
                  <div
                    key={j.id}
                    className={`bg-white rounded-2xl shadow-md p-5 flex flex-col ${disabled ? 'opacity-60' : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'} transition-all`}
                    onClick={() => !disabled && startJob(j)}
                  >
                    <div className="text-4xl mb-2">{j.icon}</div>
                    <h3 className="font-bold text-lg text-gray-800">{j.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex-1">{j.description}</p>
                    <div className="mt-3 text-sm space-y-1">
                      <p className="text-pink-600 font-semibold">时薪 ¥{j.hourlyPay} · 每次 {j.hours} 小时</p>
                      <p className="text-gray-500">体力消耗 -{j.staminaCost}</p>
                      <p className="text-gray-500">完成奖励：{j.rewardLabel}+3</p>
                      {j.requirement && (
                        <p className={ok ? 'text-green-600' : 'text-red-500'}>
                          门槛：{j.requirement.label}
                          {ok ? ' ✓' : `（当前${character[j.requirement.key]}）`}
                        </p>
                      )}
                      {ok && !enoughStamina && (
                        <p className="text-red-500">体力不足，先休息一下吧（当前{character.stamina}）</p>
                      )}
                    </div>
                    <button
                      disabled={disabled}
                      className="mt-4 w-full py-2 rounded-lg text-white font-medium bg-gradient-to-r from-pink-400 to-purple-400 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed"
                    >
                      {disabled ? '暂不可接取' : '接取任务'}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="mt-5 bg-white/70 rounded-xl p-4 text-sm text-gray-600">
              当前属性：体力 {character.stamina} ｜ 学识 {character.knowledge} ｜ 存款 ¥{character.money}
            </div>
          </>
        )}

        {stage === 'briefing' && job && (
          <div className="bg-white rounded-2xl shadow-md p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{job.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{job.name} · 任务触发</h3>
                <p className="text-sm text-gray-500">预计工作 {job.hours} 小时，消耗体力 {job.staminaCost}</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">{job.description}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-gray-700 mb-5">
              工作中你会遇到 {job.steps.length} 个真实情境，你的每个选择都会影响最终评价与报酬。基础工资 ¥{job.hourlyPay * job.hours}，表现优秀可获得 1.2 倍系数，还有随机好评红包。
            </div>
            <div className="flex gap-3">
              <button
                onClick={beginWorking}
                className="flex-1 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg transition-all hover:scale-[1.02]"
              >
                开始工作
              </button>
              <button
                onClick={() => setStage('select')}
                className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                再想想
              </button>
            </div>
          </div>
        )}

        {stage === 'working' && job && (
          <div className="bg-white rounded-2xl shadow-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">
                {job.icon} {job.name} · 情境 {stepIndex + 1}/{job.steps.length}
              </h3>
              <span className="text-sm text-gray-400">当前评分 {score}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-500"
                style={{ width: `${((stepIndex + (lastReply ? 1 : 0)) / job.steps.length) * 100}%` }}
              />
            </div>
            <p className="text-lg text-gray-800 leading-relaxed mb-5">{job.steps[stepIndex].prompt}</p>
            <div className="space-y-3">
              {job.steps[stepIndex].options.map((opt) => (
                <button
                  key={opt.id}
                  disabled={!!lastReply}
                  onClick={() => chooseOption(opt)}
                  className="w-full text-left px-5 py-3 rounded-xl border-2 border-pink-100 hover:border-pink-400 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-700"
                >
                  {opt.text}
                </button>
              ))}
            </div>
            {lastReply && (
              <div className="mt-5 bg-purple-50 border border-purple-200 rounded-xl p-4 text-gray-700 animate-fade-in">
                💬 {lastReply}
              </div>
            )}
          </div>
        )}

        {stage === 'result' && settlement && (
          <div className="bg-white rounded-2xl shadow-md p-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">工作结束 · 结果反馈</h3>
            <p className="text-center text-3xl mb-3">
              {'⭐'.repeat(settlement.stars)}{'☆'.repeat(3 - settlement.stars)}
            </p>
            <p className="text-center text-gray-500 mb-5">
              {settlement.stars === 3
                ? applyName('{name}，你的表现非常出色，负责人点名表扬！', playerName)
                : settlement.stars === 2
                  ? applyName('{name}，顺利完成了这次工作，继续加油。', playerName)
                  : applyName('{name}，这次有些手忙脚乱，下次会更好的。', playerName)}
            </p>

            <div className="bg-gray-50 rounded-xl p-5 space-y-2 text-gray-700 mb-4">
              <div className="flex justify-between">
                <span>基础工资（{settlement.job.hourlyPay}×{settlement.job.hours}小时）</span>
                <span>¥{settlement.basePay}</span>
              </div>
              <div className="flex justify-between">
                <span>表现系数</span>
                <span>×{settlement.multiplier}</span>
              </div>
              <div className="flex justify-between">
                <span>好评红包</span>
                <span className={settlement.bonus ? 'text-red-500' : 'text-gray-400'}>
                  {settlement.bonus ? `+¥${settlement.bonus}` : '无'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                <span>实发工资</span>
                <span className="text-pink-600">+¥{settlement.totalPay}</span>
              </div>
              <div className="pt-2">
                <p className="font-medium mb-1">属性变化：</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(settlement.accumulatedEffects)
                    .filter(([, v]) => Number(v) !== 0)
                    .map(([k, v]) => (
                      <span
                        key={k}
                        className={`px-2.5 py-1 rounded-full text-sm ${Number(v) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                      >
                        {effectLabels[k] || k} {Number(v) > 0 ? '+' : ''}{Number(v)}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <details className="mb-5">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-600">查看工作过程回顾</summary>
              <ul className="mt-2 space-y-1 text-sm text-gray-500 list-disc list-inside">
                {settlement.replies.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </details>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSettlement(null)
                  setStage('select')
                }}
                className="flex-1 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg"
              >
                再接一单
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                返回地图
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
