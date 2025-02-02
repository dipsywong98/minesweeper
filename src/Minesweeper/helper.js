import LZUTF8 from 'lzutf8'

export function getNearIndexes(index, rows, columns) {
  if (index < 0 || index >= rows * columns) return []
  const row = Math.floor(index / columns)
  const column = index % columns
  return [
    index - columns - 1,
    index - columns,
    index - columns + 1,
    index - 1,
    index + 1,
    index + columns - 1,
    index + columns,
    index + columns + 1,
  ].filter((_, arrayIndex) => {
    if (row === 0 && arrayIndex < 3) return false
    if (row === rows - 1 && arrayIndex > 4) return false
    if (column === 0 && [0, 3, 5].includes(arrayIndex)) return false
    if (column === columns - 1 && [2, 4, 7].includes(arrayIndex)) return false
    return true
  })
}

//   ceils: Array {
//     state: 'cover' || 'flag' || 'unknown' || 'open' || 'die' || 'misflagged' || 'mine',
//     minesAround: Number (negative for mine itself),
//     opening: true || false
//   }
export const serialize = (rows, cols, ceils) => {
  const flags = ceils.map(({ state }) => state === 'mine' ? '1' : '0').join('')
  return LZUTF8.compress([rows, cols, flags].join(','), { outputEncoding: 'Base64' })
}

export const deserialize = packed => {
  const [rowsS, colsS, flags] = LZUTF8.decompress(packed, { inputEncoding: 'Base64' }).split(',')
  const rows = Number.parseInt(rowsS)
  const cols = Number.parseInt(colsS)
  const mineK = []
  const ceils = flags.split('').map((flag, k) => {
    if (flag === '1') {
      mineK.push(k)
    }
    return {
      state: 'cover',
      minesAround: flag === '1' ? -10 : 0
    }
  })
  mineK.forEach(k => {
    getNearIndexes(k, rows, cols).forEach(nearIndex => {
      ceils[nearIndex].minesAround += 1
    })
  })
  return {
    rows,
    columns: cols,
    ceils,
    mines: mineK.length
  }
}
