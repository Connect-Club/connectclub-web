const flattenInput = (...args: any[]): [string] => {
  let res: string[] = []
  args.forEach((input: any) => {
    if (typeof input === 'symbol' || typeof input === 'function') {
      return true
    } else if (input instanceof Array) {
      input.forEach((inp) => {
        res = res.concat(flattenInput(inp))
      })
    } else if (typeof URL !== 'undefined' && input instanceof URL) {
      res = res.concat(input.toJSON())
    } else if (input instanceof Object) {
      const keys = Object.keys(input)
      for (let k = 0; k < keys.length; k++) {
        const key = keys[k]
        res = res.concat([key]).concat(flattenInput(input[key]))
      }
    } else {
      res = res.concat(input)
    }
  })
  return [res.join(',')]
}

export default flattenInput
