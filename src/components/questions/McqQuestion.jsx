// 4지선다 / OX 공통 선택형 문제
// onSelect(choiceIndex, isCorrect) 호출로 결과 전달
export default function McqQuestion({ question, locked, selected, onSelect }) {
  const isOx = question.type === 'ox'
  const choices = isOx ? ['O', 'X'] : question.choices
  const answerIndex = isOx ? (question.answer ? 0 : 1) : question.answer

  return (
    <div className={isOx ? 'ox-choices' : 'choices'}>
      {choices.map((c, i) => {
        let cls = 'choice'
        if (locked) {
          if (i === answerIndex) cls += ' correct'
          else if (i === selected) cls += ' wrong'
        }
        return (
          <button
            key={i}
            className={cls}
            disabled={locked}
            onClick={() => onSelect(i, i === answerIndex)}
          >
            {c}
          </button>
        )
      })}
    </div>
  )
}
